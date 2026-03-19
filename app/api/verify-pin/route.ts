import { NextRequest, NextResponse } from 'next/server';

// 실제로는 데이터베이스나 환경변수에서 관리해야 합니다
const VALID_PINS = ['1234', '5678', '9999'];

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

    // PIN 검증
    if (VALID_PINS.includes(pin)) {
      return NextResponse.json({
        success: true,
        message: 'PIN 코드가 확인되었습니다.',
      });
    } else {
      return NextResponse.json(
        { success: false, message: '올바르지 않은 PIN 코드입니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
