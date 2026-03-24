import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 공개 설정 가져오기 (인증 불필요)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*');

    if (error) {
      console.error('Settings fetch error:', error);
      // 에러 시 기본값 반환
      return NextResponse.json({
        success: true,
        settings: {
          ad_url: 'https://www.w3schools.com/html/mov_bbb.mp4'
        }
      });
    }

    // key-value 객체로 변환
    const settings: Record<string, string> = {};
    data?.forEach((item: any) => {
      settings[item.key] = item.value;
    });

    // ad_url이 없으면 기본값 설정
    if (!settings.ad_url) {
      settings.ad_url = 'https://www.w3schools.com/html/mov_bbb.mp4';
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    // 에러 시 기본값 반환
    return NextResponse.json({
      success: true,
      settings: {
        ad_url: 'https://www.w3schools.com/html/mov_bbb.mp4'
      }
    });
  }
}
