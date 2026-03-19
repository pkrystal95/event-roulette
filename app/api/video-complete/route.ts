import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 영상 시청 완료 로깅 또는 데이터베이스 저장 가능
    return NextResponse.json({
      success: true,
      message: '영상 시청이 완료되었습니다.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
