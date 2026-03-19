import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateSecondResult } from '@/lib/googleSheets';

// 6개 영역의 상품과 확률
const PRIZES = [
  { sector: 1, name: '10% 할인', weight: 15, message: '10% 할인 쿠폰을 받으셨습니다!' },
  { sector: 2, name: '꽝', weight: 35, message: '아쉽지만 다음 기회에 도전해보세요. 추가 참여로 한번 더 도전하세요!' },
  { sector: 3, name: '무료쿠폰', weight: 10, message: '무료쿠폰을 받으셨습니다!' },
  { sector: 4, name: '20% 할인', weight: 5, message: '20% 할인 쿠폰을 받으셨습니다!' },
  { sector: 5, name: '꽝', weight: 30, message: '아쉽지만 다음 기회에 도전해보세요. 추가 참여로 한번 더 도전하세요!' },
  { sector: 6, name: '5% 할인', weight: 5, message: '5% 할인 쿠폰을 받으셨습니다!' },
];

function selectPrize() {
  const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of PRIZES) {
    random -= prize.weight;
    if (random <= 0) {
      return prize;
    }
  }

  return PRIZES[1]; // 기본값 (꽝)
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

    // 상품 추첨
    const prize = selectPrize();

    // 두 번째 참여인 경우 Google Sheets에 결과 업데이트
    const isSecondSpin = extraChanceUsed && !participated && phone;
    console.log('🎰 두 번째 스핀 체크:', { isSecondSpin, extraChanceUsed, participated, phone });

    if (isSecondSpin) {
      try {
        console.log('📊 Google Sheets 업데이트 시도:', { phone, prize: prize.name });
        await updateSecondResult(phone, prize.name);
        console.log('✅ 두 번째 결과 업데이트 완료:', { phone, prize: prize.name });
      } catch (error) {
        console.error('❌ 두 번째 결과 업데이트 실패:', error);
        // 에러가 발생해도 사용자에게는 결과를 보여줌
      }
    } else {
      console.log('ℹ️ 첫 번째 스핀 - Google Sheets 업데이트 생략');
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
