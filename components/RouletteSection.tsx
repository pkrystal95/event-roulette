'use client';

import { useState, useEffect } from 'react';
import { cookieUtils } from '@/lib/cookies';
import Image from 'next/image';

// 6개 영역의 상품 (영역 1~6)
const PRIZES = {
  1: "10% 할인",
  2: "꽝",
  3: "무료쿠폰",
  4: "20% 할인",
  5: "꽝",
  6: "5% 할인"
};

// 각 영역의 타겟 각도 (12시 방향이 0도)
const SECTOR_ANGLES = {
  1: 30,   // 0~60도
  2: 90,   // 60~120도
  3: 150,  // 120~180도
  4: 210,  // 180~240도
  5: 270,  // 240~300도
  6: 330   // 300~360도
};

export default function RouletteSection() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState<{ prize: string; message: string; sector?: number } | null>(null);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [extraChanceUsed, setExtraChanceUsed] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // 휴대폰 번호 자동 포맷팅 (010-0000-0000)
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
      // 11자리 초과 시 11자리까지만
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  useEffect(() => {
    setHasParticipated(cookieUtils.hasParticipated());
    setExtraChanceUsed(cookieUtils.hasUsedExtraChance());
  }, []);

  // 결과 팝업 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (showResultModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 클린업: 컴포넌트 언마운트 시 원상복구
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showResultModal]);

  const handleSpinButtonClick = async () => {
    if (spinning) return;

    if (hasParticipated && extraChanceUsed) {
      alert('이미 모든 참여 기회를 사용하셨습니다.');
      return;
    }

    if (hasParticipated && !extraChanceUsed) {
      alert('결과 팝업에서 정보를 입력하고 한 번 더 도전하세요!');
      return;
    }

    await spinRoulette();
  };

  const spinRoulette = async () => {
    setSpinning(true);

    try {
      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        // 서버에서 받은 sector 값으로 회전
        const targetSector = data.sector || 1;
        const targetAngle = SECTOR_ANGLES[targetSector as keyof typeof SECTOR_ANGLES];

        // 5바퀴 이상 회전 + 목표 각도
        const baseRotation = 360 * 5;
        const finalRotation = baseRotation + (360 - targetAngle);

        setRotation(rotation + finalRotation);

        setTimeout(() => {
          setResult({
            prize: data.prize,
            message: data.message,
            sector: targetSector
          });
          setShowResultModal(true);
          setSpinning(false);
          setHasParticipated(true);
        }, 4000);
      } else {
        alert(data.message);
        setSpinning(false);
      }
    } catch (err) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      setSpinning(false);
    }
  };

  const handleExtraFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const isFirstWin = result && !result.prize.includes('꽝');

    try {
      const response = await fetch('/api/extra-chance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          firstResult: result?.prize || '', // 첫 번째 결과 전송
          isWinner: isFirstWin // 당첨 여부 전송
        }),
      });

      const data = await response.json();

      if (data.success) {
        setName('');
        setPhone('');
        setExtraChanceUsed(true);

        // 당첨자는 정보만 제출하고 종료
        if (isFirstWin) {
          setShowResultModal(false);
          alert('정보가 등록되었습니다. 등록하신 연락처로 안내드립니다.');
        } else {
          // 낙첨자는 추가 참여
          setShowResultModal(false);
          setHasParticipated(false);
          setTimeout(() => {
            spinRoulette();
          }, 500);
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setFormLoading(false);
    }
  };

  const isWinner = result && !result.prize.includes('꽝');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h2 className="text-4xl font-bold text-white mb-4 mt-8">
          룰렛 이벤트
        </h2>
        <p className="text-purple-100 mb-8">
          GO 버튼을 눌러 행운을 시험해보세요
        </p>

        {/* 룰렛 */}
        <div className="relative flex items-center justify-center mb-8">
          {/* 룰렛 휠 컨테이너 */}
          <div className="relative w-full max-w-[450px] aspect-square">
            {/* 화살표 (고정) - 룰렛 테두리 부분에 위치 */}
            <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 z-30">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/assets/arrow.png"
                  alt="화살표"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
            </div>
            {/* 뒷판 (고정) */}
            <div className="absolute inset-0 z-10">
              <Image
                src="/assets/back.png"
                alt="룰렛 뒷판"
                fill
                className="object-contain"
              />
            </div>

            {/* 앞판 (회전) */}
            <div
              className="absolute inset-0 z-20"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              <Image
                src="/assets/front.png"
                alt="룰렛 앞판"
                fill
                className="object-contain"
              />
            </div>

            {/* GO 버튼 */}
            <button
              onClick={handleSpinButtonClick}
              disabled={spinning}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] z-30 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                spinning ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Image
                src="/assets/button.png"
                alt="GO 버튼"
                fill
                className="object-contain"
              />
            </button>
          </div>
        </div>

        {/* 이미 참여한 경우 메시지 */}
        {hasParticipated && !spinning && (
          <div className="mb-4 bg-red-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg animate-pulse">
            이미 룰렛을 참여하셨습니다!
          </div>
        )}

        <p className="text-xs text-purple-200 mt-6">
          {hasParticipated && !extraChanceUsed
            ? '다시 도전하려면 정보를 입력해주세요'
            : hasParticipated && extraChanceUsed
            ? '모든 참여 기회를 사용하셨습니다'
            : '1회 참여 가능 (추가 참여 시 1회 더 기회 제공)'}
        </p>

        {/* 유의사항 */}
        <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-left">
          <h3 className="text-lg font-bold text-white mb-4">유의사항</h3>
          <ul className="space-y-3 text-sm text-purple-100 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>이벤트 참여 및 당첨자 선정, 경품 발송을 위해 개인정보가 수집되며 이벤트 참여를 위해 개인정보 수집 및 이용 동의가 필요합니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>잘못된 개인정보를 입력하여 당첨자에게 연락이 불가능하거나 오발송 되는 경우 경품 당첨이 취소될 수 있습니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>부정한 방법(개인 정보 도용, 불법 프로그램 등)으로 이벤트에 참여한 것이 발견된 경우 당첨이 취소될 수 있습니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>이벤트 주관사의 사정에 의해 이벤트 내용 및 경품이 예고없이 변경되거나 종료될 수 있습니다.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 결과 팝업 */}
      {showResultModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[340px] max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="text-center">
              <div className="text-4xl mb-2">{isWinner ? '🎉' : '😢'}</div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {isWinner ? '축하합니다!' : '아쉽네요'}
              </h3>
              <div className={`text-lg font-bold mb-3 ${isWinner ? 'text-green-600' : 'text-gray-600'}`}>
                {result.prize}
              </div>
              {!extraChanceUsed && (
                <p className="text-xs text-gray-600 mb-3">{result.message}</p>
              )}
              {extraChanceUsed && (
                <p className="text-xs text-gray-600 mb-3">
                  {isWinner
                    ? '등록하신 연락처로 안내드립니다.'
                    : '다음 기회에 도전해주세요!'}
                </p>
              )}

              {!extraChanceUsed ? (
                <>
                  <p className="text-xs text-purple-600 mb-3 font-semibold">
                    {isWinner ? '당첨자 정보를 입력해주세요' : '정보 입력 시 한 번 더 도전!'}
                  </p>
                  <form onSubmit={handleExtraFormSubmit} className="space-y-2">
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        placeholder="이름"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        placeholder="010-0000-0000"
                        maxLength={13}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading || !name || !phone}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-2 rounded-lg transition-all transform hover:scale-105 disabled:transform-none text-sm"
                    >
                      {formLoading ? '처리 중...' : (isWinner ? '정보 제출하기' : '한 번 더 도전하기')}
                    </button>
                  </form>
                </>
              ) : (
                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 text-sm"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
