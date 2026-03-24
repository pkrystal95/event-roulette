import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, message: '관리자 비밀번호가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 비밀번호 검증
    if (password === adminPassword) {
      const response = NextResponse.json({
        success: true,
        message: '로그인 성공',
      });

      // 인증 쿠키 설정 (1일 유효)
      response.cookies.set('admin_authenticated', 'true', {
        maxAge: 60 * 60 * 24, // 24시간
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: '인증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 로그아웃 API
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: '로그아웃 성공',
  });

  // 인증 쿠키 삭제
  response.cookies.delete('admin_authenticated');

  return response;
}
