import { google } from 'googleapis';

// Google Sheets API 인증 및 클라이언트 생성
export async function getGoogleSheetsClient() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient as any });

  return sheets;
}

// Google Sheets에 데이터 추가
export async function appendToSheet(data: {
  name: string;
  phone: string;
  pinNumber?: string;
  firstResult: string;
  secondResult?: string;
  timestamp: string;
}) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured');
  }

  // 당첨 여부 계산
  const isFirstWin = !data.firstResult.includes('꽝');
  const isSecondWin = data.secondResult ? !data.secondResult.includes('꽝') : false;

  const participationCount = data.secondResult ? 2 : 1;
  const winCount = (isFirstWin ? 1 : 0) + (isSecondWin ? 1 : 0);

  // 당첨 상품 목록
  const winningPrizes = [
    isFirstWin ? data.firstResult : null,
    isSecondWin ? data.secondResult : null,
  ].filter(Boolean).join(', ') || '없음';

  // 데이터 추가
  // A: 이름, B: 전화번호, C: PIN번호, D: 참여횟수, E: 당첨횟수, F: 1차결과, G: 2차결과, H: 당첨상품, I: 참여시간
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        data.name,
        data.phone,
        data.pinNumber || '-',
        participationCount,
        winCount,
        data.firstResult,
        data.secondResult || '-',
        winningPrizes,
        data.timestamp
      ]],
    },
  });
}

// 전화번호 중복 체크
export async function checkPhoneDuplicate(phone: string): Promise<boolean> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured');
  }

  try {
    // Sheet1의 B열 (전화번호) 전체 읽기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!B:B',
    });

    const values = response.data.values || [];

    // 전화번호 중복 확인 (헤더 제외)
    const phoneNumbers = values.slice(1).map((row) => row[0]);
    return phoneNumbers.includes(phone);
  } catch (error) {
    console.error('Error checking phone duplicate:', error);
    // 시트가 비어있거나 오류 발생 시 중복 없음으로 처리
    return false;
  }
}

// Google Sheets 초기화 (헤더 추가)
export async function initializeSheet() {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured');
  }

  try {
    // 첫 번째 행에 헤더가 있는지 확인
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:I1',
    });

    // 헤더가 없으면 추가
    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:I1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['이름', '전화번호', 'PIN번호', '참여수', '당첨수', '1차 결과', '2차 결과', '당첨 상품', '참여시간']],
        },
      });
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
  }
}

// 두 번째 결과 업데이트
export async function updateSecondResult(phone: string, secondResult: string) {
  console.log('📊 updateSecondResult 호출:', { phone, secondResult });

  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured');
  }

  try {
    // 전화번호로 행 찾기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:I',
    });

    const values = response.data.values || [];
    console.log('📊 시트 전체 데이터:', values.length, '행');
    console.log('📊 전화번호 열 (B열):', values.slice(0, 5).map(row => row[1]));

    const rowIndex = values.findIndex((row, idx) => {
      const match = idx > 0 && row[1] === phone;
      if (match) {
        console.log('📊 전화번호 매칭 성공:', { idx, phone, rowPhone: row[1] });
      }
      return match;
    });

    console.log('📊 찾은 행 인덱스:', rowIndex);

    if (rowIndex === -1) {
      console.error('❌ 전화번호를 시트에서 찾을 수 없음:', phone);
      console.error('📊 시트의 전화번호 목록:', values.slice(1).map(row => row[1]));
      return;
    }

    const actualRow = rowIndex + 1; // 1-based index
    console.log('📊 업데이트할 실제 행 번호:', actualRow);

    // 기존 데이터 가져오기
    const existingData = values[rowIndex];
    const firstResult = existingData[5]; // PIN 추가로 인덱스 변경: 4 -> 5

    // 당첨 여부 재계산
    const isFirstWin = !firstResult.includes('꽝');
    const isSecondWin = !secondResult.includes('꽝');

    const participationCount = 2;
    const winCount = (isFirstWin ? 1 : 0) + (isSecondWin ? 1 : 0);

    // 당첨 상품 목록
    const winningPrizes = [
      isFirstWin ? firstResult : null,
      isSecondWin ? secondResult : null,
    ].filter(Boolean).join(', ') || '없음';

    // 2차 결과, 참여수, 당첨수, 당첨상품 업데이트 (D열부터 H열)
    const updateData = [participationCount, winCount, firstResult, secondResult, winningPrizes];
    console.log('📊 업데이트할 데이터:', updateData);
    console.log('📊 업데이트 범위:', `Sheet1!D${actualRow}:H${actualRow}`);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!D${actualRow}:H${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updateData],
      },
    });

    console.log('✅ Google Sheets 업데이트 완료');

  } catch (error) {
    console.error('❌ Error updating second result:', error);
    throw error;
  }
}
