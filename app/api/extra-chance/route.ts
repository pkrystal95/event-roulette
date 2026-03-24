import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { appendToSheet, checkPhoneDuplicate } from '@/lib/googleSheets';
import { supabaseAdmin } from '@/lib/supabase';

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

    // 쿠키에서 PIN 번호 가져오기
    const cookieStore = await cookies();
    const pinNumber = cookieStore.get('event_pin')?.value;

    if (!pinNumber) {
      return NextResponse.json(
        { success: false, message: 'PIN 번호를 확인할 수 없습니다.' },
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

    const extraChanceUsed = cookieStore.get('event_extra_chance_used')?.value === 'true';

    // 이미 추가 기회를 사용한 경우 (쿠키 체크)
    if (extraChanceUsed) {
      return NextResponse.json(
        { success: false, message: '이미 추가 기회를 사용하셨습니다.' },
        { status: 403 }
      );
    }

    // 전화번호 중복 체크 (Supabase)
    const { data: existingParticipant, error: checkError } = await supabaseAdmin
      .from('participants')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingParticipant) {
      return NextResponse.json(
        { success: false, message: '이미 참여하신 전화번호입니다.' },
        { status: 409 }
      );
    }

    // Supabase에 참가자 정보 저장
    const { data: participant, error: insertError } = await supabaseAdmin
      .from('participants')
      .insert([
        {
          name,
          phone,
          pin_number: pinNumber,
          first_result: firstResult,
          second_result: null,
          is_winner: isWinner,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase 저장 실패:', insertError);
      throw new Error('참가자 정보 저장에 실패했습니다.');
    }

    console.log('✅ Supabase 저장 완료:', { name, phone, firstResult, isWinner });

    // Google Sheets에도 백업 (선택사항)
    try {
      const isDuplicate = await checkPhoneDuplicate(phone);
      if (!isDuplicate) {
        const timestamp = new Date().toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
        });

        await appendToSheet({
          name,
          phone,
          pinNumber,
          firstResult,
          timestamp,
        });

        console.log('✅ Google Sheets 백업 완료');
      }
    } catch (sheetsError) {
      console.error('Google Sheets 백업 실패 (무시):', sheetsError);
    }

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
      // 참여 쿠키 삭제 (다시 룰렛 참여 가능)
      response.cookies.delete('event_participated');

      // 두 번째 결과 업데이트를 위해 전화번호 저장
      response.cookies.set('event_phone', phone, {
        maxAge: 60 * 60 * 24, // 1일
        httpOnly: true,
        path: '/',
      });

      console.log('✅ 낙첨자 쿠키 삭제 완료 - 2차 참여 가능');
    } else {
      // 당첨자는 더 이상 참여 불가
      response.cookies.set('event_participated', 'true', {
        maxAge: 60 * 60 * 24 * 365, // 1년
        httpOnly: false,
        path: '/',
      });

      console.log('✅ 당첨자 쿠키 설정 완료 - 추가 참여 불가');
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
