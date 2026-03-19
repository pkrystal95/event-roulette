import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { appendToSheet, checkPhoneDuplicate } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, firstResult, isWinner } = body;

    if (!name || !phone || !firstResult) {
      return NextResponse.json(
        { success: false, message: '이름과 전화번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('📝 Extra chance API 호출:', { name, phone, firstResult, isWinner });

    // 전화번호 형식 검증 (선택사항)
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: '올바른 전화번호 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const extraChanceUsed = cookieStore.get('event_extra_chance_used')?.value === 'true';

    // 이미 추가 기회를 사용한 경우 (쿠키 체크)
    if (extraChanceUsed) {
      return NextResponse.json(
        { success: false, message: '이미 추가 기회를 사용하셨습니다.' },
        { status: 403 }
      );
    }

    // 전화번호 중복 체크 (Google Sheets)
    const isDuplicate = await checkPhoneDuplicate(phone);
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, message: '이미 참여하신 전화번호입니다.' },
        { status: 409 }
      );
    }

    // Google Sheets에 저장 (첫 번째 결과 포함)
    const timestamp = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });

    await appendToSheet({
      name,
      phone,
      firstResult,
      timestamp
    });

    console.log('추가 참여 정보 저장 완료:', { name, phone, firstResult, timestamp });

    // 응답 생성
    const response = NextResponse.json({
      success: true,
      message: isWinner
        ? '당첨자 정보가 등록되었습니다.'
        : '추가 참여가 완료되었습니다. 다시 도전하세요!',
    });

    // 추가 기회 사용 쿠키 설정
    response.cookies.set('event_extra_chance_used', 'true', {
      maxAge: 60 * 60 * 24 * 365, // 1년
      httpOnly: false,
      path: '/',
    });

    // 낙첨자만 추가 참여 가능하도록 쿠키 설정
    if (!isWinner) {
      // 참여 쿠키 초기화 (다시 룰렛 참여 가능)
      response.cookies.set('event_participated', 'false', {
        maxAge: 0, // 쿠키 삭제
        httpOnly: false,
        path: '/',
      });

      // 두 번째 결과 업데이트를 위해 전화번호 저장
      response.cookies.set('event_phone', phone, {
        maxAge: 60 * 60 * 24, // 1일
        httpOnly: true,
        path: '/',
      });
    } else {
      // 당첨자는 더 이상 참여 불가
      response.cookies.set('event_participated', 'true', {
        maxAge: 60 * 60 * 24 * 365, // 1년
        httpOnly: false,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Extra chance error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
