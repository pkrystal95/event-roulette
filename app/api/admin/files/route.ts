import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

// 파일 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Supabase Storage에서 파일 목록 조회
    const { data: files, error } = await supabaseAdmin.storage
      .from('roulette-assets')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;

    // Public URL 추가
    const filesWithUrls = files.map((file) => {
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from('roulette-assets').getPublicUrl(file.name);

      return {
        name: file.name,
        url: publicUrl,
        size: file.metadata?.size,
        created_at: file.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      files: filesWithUrls,
    });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { success: false, message: '파일 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 파일 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 인증 확인
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('name');

    if (!fileName) {
      return NextResponse.json(
        { success: false, message: '파일 이름이 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase Storage에서 파일 삭제
    const { error } = await supabaseAdmin.storage
      .from('roulette-assets')
      .remove([fileName]);

    if (error) throw error;

    // 메타데이터도 삭제
    await supabaseAdmin.from('file_metadata').delete().eq('file_path', fileName);

    return NextResponse.json({
      success: true,
      message: '파일이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { success: false, message: '파일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
