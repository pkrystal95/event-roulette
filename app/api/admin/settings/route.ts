import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

// 설정 가져오기 (GET)
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
    // settings 테이블에서 모든 설정 가져오기
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*');

    if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json(
        { success: false, message: '설정을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // key-value 객체로 변환
    const settings: Record<string, string> = {};
    data?.forEach((item: any) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 설정 저장하기 (POST)
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
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, message: 'key와 value가 필요합니다.' },
        { status: 400 }
      );
    }

    // upsert: 존재하면 업데이트, 없으면 삽입
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      console.error('Settings upsert error:', error);
      return NextResponse.json(
        { success: false, message: '설정 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: '설정이 저장되었습니다.' });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
