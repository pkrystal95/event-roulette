import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, message: '전화번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase에서 해당 전화번호로 참가자 정보 조회
    const { data: participant, error } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { success: false, message: '참여 내역을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 결과 데이터 구성
    const results = {
      name: participant.name,
      phone: participant.phone,
      firstResult: participant.first_result,
      secondResult: participant.second_result,
      isWinner: participant.is_winner,
      createdAt: participant.created_at,
    };

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('My results error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
