import { NextRequest, NextResponse } from 'next/server';
import { verifyPinCode } from '@/lib/pinCodes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, message: 'PIN 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // PIN 코드 검증 (Excel 파일에서)
    const isValid = verifyPinCode(pin);

    if (isValid) {
      // PIN 코드를 쿠키에 저장 (나중에 참가자 정보 저장 시 사용)
      const response = NextResponse.json({
        success: true,
        message: 'PIN 코드가 확인되었습니다.',
      });

      response.cookies.set('event_pin', pin, {
        maxAge: 60 * 60 * 24, // 1일
        httpOnly: true,
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: '올바르지 않은 PIN 코드입니다. PIN 코드를 확인해주세요.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('PIN 검증 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
