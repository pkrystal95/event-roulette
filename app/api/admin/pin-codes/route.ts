import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { clearPinCodesCache, loadPinCodes } from '@/lib/pinCodes';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// PIN 코드 목록 조회 (GET)
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
    const pinCodes = loadPinCodes();
    return NextResponse.json({
      success: true,
      count: pinCodes.size,
      samplePins: Array.from(pinCodes).slice(0, 10)
    });
  } catch (error) {
    console.error('PIN codes GET error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PIN 코드 엑셀 파일 업로드 (POST)
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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 검증
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, message: 'Excel 파일(.xlsx, .xls)만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 읽기
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Excel 파일 파싱
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // JSON으로 변환
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log('📝 총 행 수:', data.length);

    // PIN 코드 추출 및 검증
    const pinCodes = data
      .map((row: any) =>
        row['매장 코드'] || row['PIN'] || row['pin'] || row['Pin'] ||
        row['CODE'] || row['code'] || row['핀코드'] || row['핀 코드']
      )
      .filter((pin: any) => {
        if (!pin) return false;
        const pinStr = String(pin).trim();
        return /^P\d{6}$/.test(pinStr);
      })
      .map((pin: any) => String(pin).trim().toUpperCase());

    console.log('✅ 유효한 PIN 코드 수:', pinCodes.length);

    if (pinCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: '유효한 PIN 코드를 찾을 수 없습니다. Excel 파일의 형식을 확인해주세요.' },
        { status: 400 }
      );
    }

    // 중복 제거
    const uniquePins = [...new Set(pinCodes)];
    const duplicateCount = pinCodes.length - uniquePins.length;

    console.log('📊 중복 제거 후:', uniquePins.length, '개');
    if (duplicateCount > 0) {
      console.log('⚠️  중복 제거:', duplicateCount, '개');
    }

    // JSON 파일로 저장
    const jsonPath = path.join(process.cwd(), 'data', 'pin_codes.json');
    const excelPath = path.join(process.cwd(), 'data', 'pin_code.xlsx');

    // 백업 생성 (기존 파일이 있는 경우)
    if (fs.existsSync(jsonPath)) {
      const backupPath = path.join(process.cwd(), 'data', `pin_codes_backup_${Date.now()}.json`);
      fs.copyFileSync(jsonPath, backupPath);
      console.log('📦 백업 생성:', backupPath);
    }

    if (fs.existsSync(excelPath)) {
      const backupPath = path.join(process.cwd(), 'data', `pin_code_backup_${Date.now()}.xlsx`);
      fs.copyFileSync(excelPath, backupPath);
      console.log('📦 엑셀 백업 생성:', backupPath);
    }

    // JSON 파일 저장
    fs.writeFileSync(jsonPath, JSON.stringify(uniquePins, null, 2));
    console.log('💾 JSON 파일 저장 완료');

    // 원본 엑셀 파일도 저장
    fs.writeFileSync(excelPath, buffer);
    console.log('💾 Excel 파일 저장 완료');

    // 캐시 초기화
    clearPinCodesCache();
    console.log('🔄 캐시 초기화 완료');

    return NextResponse.json({
      success: true,
      message: 'PIN 코드가 성공적으로 업데이트되었습니다.',
      stats: {
        total: pinCodes.length,
        unique: uniquePins.length,
        duplicates: duplicateCount,
        samplePins: uniquePins.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('PIN codes upload error:', error);
    return NextResponse.json(
      { success: false, message: '파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
