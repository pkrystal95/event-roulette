import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

// 경품 목록 조회
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

    // Supabase에서 경품 목록 조회
    const { data: prizes, error } = await supabaseAdmin
      .from('prizes')
      .select('*')
      .order('sector', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      prizes,
    });
  } catch (error) {
    console.error('Get prizes error:', error);
    return NextResponse.json(
      { success: false, message: '경품 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 경품 추가
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

    const { name, message, sector, weight, is_active } = await request.json();

    // 유효성 검사
    if (!name || !message || !sector || weight === undefined) {
      return NextResponse.json(
        { success: false, message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // Supabase에 경품 추가
    const { data, error } = await supabaseAdmin
      .from('prizes')
      .insert([{ name, message, sector, weight, is_active: is_active ?? true }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '경품이 추가되었습니다.',
      prize: data,
    });
  } catch (error) {
    console.error('Add prize error:', error);
    return NextResponse.json(
      { success: false, message: '경품 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 경품 수정
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id, name, message, sector, weight, is_active } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: '경품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase에서 경품 수정
    const { data, error } = await supabaseAdmin
      .from('prizes')
      .update({ name, message, sector, weight, is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '경품이 수정되었습니다.',
      prize: data,
    });
  } catch (error) {
    console.error('Update prize error:', error);
    return NextResponse.json(
      { success: false, message: '경품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 경품 삭제
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '경품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase에서 경품 삭제
    const { error } = await supabaseAdmin
      .from('prizes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '경품이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete prize error:', error);
    return NextResponse.json(
      { success: false, message: '경품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
