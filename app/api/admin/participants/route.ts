import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

// 당첨자 목록 조회
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const prizeFilter = searchParams.get('prize') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 쿼리 빌드
    let query = supabaseAdmin
      .from('participants')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // 검색 필터 (이름 또는 전화번호)
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // 경품 필터
    if (prizeFilter) {
      query = query.or(
        `first_result.eq.${prizeFilter},second_result.eq.${prizeFilter}`
      );
    }

    // 날짜 필터 (시작일)
    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    // 날짜 필터 (종료일 - 다음날 00:00:00 전까지)
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      query = query.lt('created_at', endDateTime.toISOString());
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data: participants, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      participants: participants || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Get participants error:', error);
    return NextResponse.json(
      { success: false, message: '당첨자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 엑셀 다운로드용 전체 데이터 조회
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

    // 전체 데이터 조회 (페이지네이션 없음)
    const { data: participants, error } = await supabaseAdmin
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      participants: participants || [],
    });
  } catch (error) {
    console.error('Get all participants error:', error);
    return NextResponse.json(
      { success: false, message: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 당첨자 삭제 (테스트용)
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: '삭제할 참가자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase에서 삭제
    const { error } = await supabaseAdmin
      .from('participants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete participant error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '참가자가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json(
      { success: false, message: '삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
