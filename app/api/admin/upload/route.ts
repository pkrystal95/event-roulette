import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

export const maxDuration = 120;

const execFileAsync = promisify(execFile);
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

async function compressVideo(inputPath: string, outputPath: string): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-i', inputPath,
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '64k',
    '-movflags', '+faststart',
    '-y',
    outputPath,
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop();
    const bytes = await file.arrayBuffer();
    let uploadBuffer = Buffer.from(bytes);

    // 50MB 초과 시 서버에서 ffmpeg 압축
    if (uploadBuffer.byteLength > MAX_SIZE) {
      const tmpDir = join(tmpdir(), 'kmong-upload');
      await mkdir(tmpDir, { recursive: true });
      const inputPath = join(tmpDir, `input-${Date.now()}.mp4`);
      const outputPath = join(tmpDir, `output-${Date.now()}.mp4`);

      try {
        await writeFile(inputPath, uploadBuffer);
        await compressVideo(inputPath, outputPath);
        uploadBuffer = await readFile(outputPath);

        const compressedMB = (uploadBuffer.byteLength / 1024 / 1024).toFixed(1);
        console.log(`압축 완료: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${compressedMB}MB`);

        if (uploadBuffer.byteLength > MAX_SIZE) {
          return NextResponse.json(
            { success: false, message: `압축 후에도 ${compressedMB}MB로 50MB를 초과합니다. 더 짧은 영상을 사용해주세요.` },
            { status: 400 }
          );
        }
      } finally {
        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
      }
    }

    const { error } = await supabaseAdmin.storage
      .from('roulette-assets')
      .upload(fileName, uploadBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    await supabaseAdmin
      .from('file_metadata')
      .upsert([{
        file_name: fileName,
        file_path: fileName,
        file_type: fileExt || 'unknown',
        file_size: uploadBuffer.byteLength,
        bucket_name: 'roulette-assets',
      }])
      .select()
      .single();

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('roulette-assets')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      message: '파일이 업로드되었습니다.',
      file: {
        name: fileName,
        path: fileName,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
