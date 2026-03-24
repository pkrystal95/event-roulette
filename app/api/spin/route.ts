import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateSecondResult } from '@/lib/googleSheets';
import { supabaseAdmin } from '@/lib/supabase';

// DB에서 경품을 조회하고 추첨하는 함수
async function selectPrize() {
  // Supabase에서 활성화된 경품 조회
  const { data: prizes, error } = await supabaseAdmin
    .from('prizes')
    .select('*')
    .eq('is_active', true)
    .order('sector', { ascending: true });

  if (error || !prizes || prizes.length === 0) {
    throw new Error('경품 정보를 불러올 수 없습니다.');
  }

  // 확률 기반 추첨
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

  // 기본값 (첫 번째 경품)
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
    const extraChanceUsed = cookieStore.get('event_extra_chance_used')?.value === 'true';
    const phone = cookieStore.get('event_phone')?.value;

    console.log('🎰 Spin API - 쿠키 상태:', {
      participated,
      extraChanceUsed,
      phone,
      isSecondSpin: extraChanceUsed && !participated && !!phone
    });

    // 이미 참여한 경우 차단
    if (participated) {
      return NextResponse.json(
        { success: false, message: '이미 참여하셨습니다.' },
        { status: 403 }
      );
    }

    // 상품 추첨 (DB에서 조회)
    const prize = await selectPrize();

    // 두 번째 참여인 경우 Supabase DB에 결과 업데이트
    const isSecondSpin = extraChanceUsed && !participated && phone;
    console.log('🎰 두 번째 스핀 체크:', { isSecondSpin, extraChanceUsed, participated, phone });

    if (isSecondSpin) {
      try {
        console.log('📊 Supabase DB 업데이트 시도:', { phone, prize: prize.name });

        // 2차 당첨 여부 확인 (경품명이 "꽝"이 아닌 경우 당첨)
        const isSecondWinner = prize.name !== '꽝';

        // Supabase에서 해당 참가자의 2차 결과 및 당첨 여부 업데이트
        const { error: updateError } = await supabaseAdmin
          .from('participants')
          .update({
            second_result: prize.name,
            is_winner: isSecondWinner  // 2차 당첨 시 is_winner를 true로 업데이트
          })
          .eq('phone', phone)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.error('❌ Supabase 업데이트 실패:', updateError);
        } else {
          console.log('✅ 두 번째 결과 업데이트 완료:', { phone, prize: prize.name, isSecondWinner });
        }

        // Google Sheets에도 기록 (백업용)
        try {
          await updateSecondResult(phone, prize.name);
        } catch (sheetsError) {
          console.error('Google Sheets 업데이트 실패 (무시):', sheetsError);
        }
      } catch (error) {
        console.error('❌ 두 번째 결과 업데이트 실패:', error);
        // 에러가 발생해도 사용자에게는 결과를 보여줌
      }
    } else {
      console.log('ℹ️ 첫 번째 스핀 - DB 업데이트 생략');
    }

    // 참여 완료 쿠키 설정
    const response = NextResponse.json({
      success: true,
      prize: prize.name,
      message: prize.message,
      sector: prize.sector,
    });

    response.cookies.set('event_participated', 'true', {
      maxAge: 60 * 60 * 24 * 365, // 1년
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
