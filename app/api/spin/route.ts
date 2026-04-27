import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

async function selectPrize() {
  const { data: prizes, error } = await supabaseAdmin
    .from('prizes')
    .select('*')
    .eq('is_active', true)
    .order('sector', { ascending: true });

  if (error || !prizes || prizes.length === 0) {
    throw new Error('경품 정보를 불러올 수 없습니다.');
  }

  const totalWeight = prizes.reduce((sum: number, prize: any) => sum + parseFloat(prize.weight), 0);
  let random = Math.random() * totalWeight;

  for (const prize of prizes) {
    random -= parseFloat(prize.weight);
    if (random <= 0) {
      return {
        sector: prize.sector,
        name: prize.name,
        message: prize.message,
        weight: prize.weight,
      };
    }
  }

  return {
    sector: prizes[0].sector,
    name: prizes[0].name,
    message: prizes[0].message,
    weight: prizes[0].weight,
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const participated = cookieStore.get('event_participated')?.value === 'true';

    if (participated) {
      return NextResponse.json(
        { success: false, message: '이미 참여하셨습니다.' },
        { status: 403 }
      );
    }

    const prize = await selectPrize();
    const pinNumber = cookieStore.get('event_pin')?.value;

    // 참여 즉시 DB에 저장 (이름/번호 없이 P코드만)
    try {
      await supabaseAdmin
        .from('participants')
        .insert([{
          pin_number: pinNumber || null,
          first_result: prize.name,
          is_winner: true,
        }]);
    } catch (dbError) {
      console.error('참가자 저장 실패:', dbError);
    }

    const response = NextResponse.json({
      success: true,
      prize: prize.name,
      message: prize.message,
      sector: prize.sector,
    });

    response.cookies.set('event_participated', 'true', {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Spin error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
