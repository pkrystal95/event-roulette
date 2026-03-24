import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
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

    // 파일 이름 (고정된 이름 사용)
    const fileName = file.name;
    const fileExt = fileName.split('.').pop();
    const filePath = fileName; // 타임스탬프 없이 파일명 그대로 사용

    // Supabase Storage에 업로드 (Service Role Key 사용 - RLS 우회)
    const { data, error } = await supabaseAdmin.storage
      .from('roulette-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // 같은 이름이면 덮어쓰기
      });

    if (error) throw error;

    // 파일 메타데이터 저장 (선택사항)
    const { data: fileMetadata, error: metadataError } = await supabaseAdmin
      .from('file_metadata')
      .upsert([
        {
          file_name: fileName,
          file_path: filePath,
          file_type: fileExt || 'unknown',
          file_size: file.size,
          bucket_name: 'roulette-assets',
        },
      ])
      .select()
      .single();

    if (metadataError) {
      console.error('Metadata save error:', metadataError);
      // 메타데이터 저장 실패해도 파일은 업로드됨
    }

    // Public URL 생성
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('roulette-assets').getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      message: '파일이 업로드되었습니다.',
      file: {
        name: fileName,
        path: filePath,
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
