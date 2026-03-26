"use client";

import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { cookieUtils } from "@/lib/cookies";
import { getRouletteImages } from "@/lib/assets";
import Image from "next/image";

// 4개 영역의 상품 (영역 1~4)
const PRIZES = {
  1: "꽝",
  2: "랩톱 미니스팀",
  3: "펩시 콜라 9캔",
  4: "아메리카노",
};

// 각 영역의 타겟 각도 (12시 방향이 0도)
const SECTOR_ANGLES = {
  1: 45,  // 0~90도
  2: 135, // 90~180도
  3: 225, // 180~270도
  4: 315, // 270~360도
};

interface RouletteSectionProps {
  onShowResults?: () => void;
}

export default function RouletteSection({ onShowResults }: RouletteSectionProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState<{
    prize: string;
    message: string;
    sector?: number;
  } | null>(null);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [extraChanceUsed, setExtraChanceUsed] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  // 중복 회전 방지를 위한 ref
  const isSpinningRef = useRef(false);

  // Supabase에서 이미지 URL 가져오기 (캐시 무효화를 위한 타임스탬프 추가)
  const baseImages = getRouletteImages();
  const images = {
    front: `${baseImages.front}?t=${imageKey}`,
    back: `${baseImages.back}?t=${imageKey}`,
    arrow: `${baseImages.arrow}?t=${imageKey}`,
    button: `${baseImages.button}?t=${imageKey}`,
  };

  // 휴대폰 번호 자동 포맷팅 (010-0000-0000)
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

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
    const participated = cookieUtils.hasParticipated();
    const extraUsed = cookieUtils.hasUsedExtraChance();

    console.log('🔍 초기 상태 확인:', { participated, extraUsed });

    setHasParticipated(participated);
    setExtraChanceUsed(extraUsed);
  }, []);

  // 결과 팝업 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (showResultModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // 클린업: 컴포넌트 언마운트 시 원상복구
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showResultModal]);

  const handleSpinButtonClick = async () => {
    const timestamp = new Date().toISOString();
    console.log('================================');
    console.log('🎯 GO 버튼 클릭:', timestamp);
    console.log('현재 상태:', {
      spinning,
      isSpinningRef: isSpinningRef.current,
      hasParticipated,
      extraChanceUsed,
      result: result ? result.prize : null
    });

    // 중복 클릭 방지
    if (spinning || isSpinningRef.current) {
      console.log('⚠️ 버튼 중복 클릭 무시 (이미 회전 중)');
      return;
    }

    if (hasParticipated && extraChanceUsed) {
      console.log('⚠️ 모든 참여 기회 사용됨');
      alert("이미 모든 참여 기회를 사용하셨습니다.");
      return;
    }

    if (hasParticipated && !extraChanceUsed) {
      console.log('⚠️ 정보 입력 필요');
      alert("결과 팝업에서 정보를 입력하고 한 번 더 도전하세요!");
      return;
    }

    console.log('✅ 룰렛 시작 조건 만족 - spinRoulette() 호출');
    await spinRoulette();
  };

  const spinRoulette = async () => {
    const callTimestamp = new Date().toISOString();
    console.log('--------------------------------');
    console.log('📞 spinRoulette() 호출됨:', callTimestamp);
    console.log('호출 시점 상태:', {
      isSpinningRef: isSpinningRef.current,
      spinning,
      hasParticipated,
      extraChanceUsed
    });

    // ref로 중복 호출 완전 차단
    if (isSpinningRef.current || spinning) {
      console.log('⚠️ spinRoulette() 중복 호출 차단! (ref:', isSpinningRef.current, ', state:', spinning, ')');
      console.log('--------------------------------');
      return;
    }

    console.log('🎰 룰렛 회전 시작 - ref와 state 설정');
    isSpinningRef.current = true;
    setSpinning(true);
    console.log('상태 업데이트 완료:', { isSpinningRef: isSpinningRef.current, spinning: true });

    // 즉시 룰렛 회전 시작 (부드러운 UX를 위해)
    const initialRotation = rotation + 360 * 3; // 3바퀴 먼저 돌림
    setRotation(initialRotation);

    try {
      // API 호출 전 한 번 더 체크
      if (!isSpinningRef.current) {
        console.log('⚠️ 회전 중단됨 (ref 변경 감지)');
        return;
      }

      console.log('📡 API 호출 시작');
      const response = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log('📥 API 응답 받음:', data);

      if (data.success) {
        // 서버에서 받은 sector 값으로 최종 회전
        const targetSector = data.sector || 1;
        const targetAngle =
          SECTOR_ANGLES[targetSector as keyof typeof SECTOR_ANGLES];

        console.log('🎯 목표 섹터:', targetSector, '/ 각도:', targetAngle);

        // 추가로 2바퀴 더 돌고 목표 각도로 도착
        const additionalRotation = 360 * 2;
        const finalRotation = initialRotation + additionalRotation + (360 - targetAngle);

        // 약간의 지연 후 최종 위치로 회전 (부드러운 전환)
        setTimeout(() => {
          setRotation(finalRotation);
        }, 100);

        setTimeout(() => {
          console.log('⏰ 4.1초 타이머 실행 - 결과 표시');
          setResult({
            prize: data.prize,
            message: data.message,
            sector: targetSector,
          });
          setShowResultModal(true);
          setSpinning(false);
          isSpinningRef.current = false; // ref 초기화
          setHasParticipated(true);
          console.log('✅ 룰렛 회전 완료 및 상태 초기화:', {
            result: data.prize,
            spinning: false,
            isSpinningRef: false,
            hasParticipated: true
          });
          console.log('================================');
        }, 4100); // 100ms + 4000ms
      } else {
        alert(data.message);
        setSpinning(false);
        isSpinningRef.current = false; // ref 초기화
      }
    } catch (err) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setSpinning(false);
      isSpinningRef.current = false; // ref 초기화
    }
  };

  // 정보만 제출하고 종료 (1회만 참여)
  const handleSubmitOnly = async () => {
    if (!name || !phone) {
      alert("이름과 전화번호를 입력해주세요.");
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch("/api/extra-chance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          firstResult: result?.prize || "",
          isWinner: true, // 모든 상품 당첨
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ 정보 제출 완료 (1회만):', { name, phone });

        setName("");
        setPhone("");
        setExtraChanceUsed(true);
        setShowResultModal(false);

        alert("매장 상담사에게 당첨 화면을 보여주세요.");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setFormLoading(false);
    }
  };

  // 정보 제출하고 2차 도전
  const handleExtraFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/extra-chance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          firstResult: result?.prize || "",
          isWinner: false, // 2차 도전을 위해 false로 전송
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ 정보 제출 완료 (2차 도전):', { name, phone });

        setName("");
        setPhone("");
        setExtraChanceUsed(true);
        setShowResultModal(false);

        // 2차 도전 가능 상태로 변경
        setHasParticipated(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setFormLoading(false);
    }
  };

  // 모든 상품이 당첨 (꽝 없음)
  const isWinner = true;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h2 className="text-4xl font-bold text-white mb-4 mt-8">룰렛 이벤트</h2>
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
                  src={images.arrow}
                  alt="화살표"
                  fill
                  className="object-contain drop-shadow-md"
                  unoptimized
                />
              </div>
            </div>
            {/* 뒷판 (고정) - 더 크게 */}
            <div className="absolute inset-0 z-10">
              <Image
                src={images.back}
                alt="룰렛 뒷판"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* 앞판 (회전) - 뒷판보다 작게 */}
            <div
              className="absolute inset-[3%] z-20"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "none",
              }}
            >
              <Image
                src={images.front}
                alt="룰렛 앞판"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* GO 버튼 */}
            <button
              onClick={handleSpinButtonClick}
              disabled={spinning}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] z-30 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                spinning ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <Image
                src={images.button}
                alt="GO 버튼"
                fill
                className="object-contain"
                unoptimized
              />
            </button>
          </div>
        </div>

        {/* 이미 참여한 경우 메시지 */}
        {hasParticipated && !spinning && (
          <div className="mb-4">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg animate-pulse mb-3">
              이미 참여하셨습니다!
            </div>
          </div>
        )}

        <p className="text-xs text-purple-200 mt-6">
          {hasParticipated && !extraChanceUsed && result
            ? "결과 팝업에서 정보를 입력해주세요"
            : hasParticipated && extraChanceUsed
              ? "참여가 완료되었습니다"
              : !hasParticipated && extraChanceUsed && result
                ? "GO 버튼을 눌러 2차 도전하세요"
              : hasParticipated && !result
                ? "룰렛 결과를 확인하는 중..."
                : ""}
        </p>

        {/* 참여 완료 후 당첨 내역 확인 버튼 */}
        {hasParticipated && extraChanceUsed && (
          <div className="mt-6">
            <button
              onClick={() => onShowResults?.()}
              className="w-full max-w-xs mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-2xl">🎁</span>
              <span>당첨 내역 확인하기</span>
            </button>
          </div>
        )}

        {/* 유의사항 */}
        <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-left">
          <h3 className="text-lg font-bold text-white mb-4">유의사항</h3>
          <ul className="space-y-3 text-sm text-purple-100 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>
                이벤트 참여 및 당첨자 선정, 경품 발송을 위해 개인정보가 수집되며
                이벤트 참여를 위해 개인정보 수집 및 이용 동의가 필요합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>
                잘못된 개인정보를 입력하여 당첨자에게 연락이 불가능하거나 오발송
                되는 경우 경품 당첨이 취소될 수 있습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>
                부정한 방법(개인 정보 도용, 불법 프로그램 등)으로 이벤트에
                참여한 것이 발견된 경우 당첨이 취소될 수 있습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>
                이벤트 주관사의 사정에 의해 이벤트 내용 및 경품이 예고없이
                변경되거나 종료될 수 있습니다.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 결과 팝업 */}
      {showResultModal && result && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={(e) => {
            // 정보 입력이 완료된 후에만 배경 클릭으로 닫기 가능
            if (extraChanceUsed && e.target === e.currentTarget) {
              setShowResultModal(false);
            }
            // 정보 입력 전에는 배경 클릭으로 닫기 방지
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[340px] max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="text-center">
              <div className="text-4xl mb-2">{isWinner ? "🎉" : "😢"}</div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {isWinner ? "축하합니다!" : "아쉽네요"}
              </h3>
              <div
                className={`text-lg font-bold mb-3 text-green-600`}
              >
                {result.prize}
              </div>
              {!extraChanceUsed && (
                <p className="text-xs text-gray-600 mb-3">{result.message}</p>
              )}
              {extraChanceUsed && (
                <p className="text-xs text-gray-600 mb-3">
                  {isWinner
                    ? "매장 상담사에게 당첨 화면을 보여주세요."
                    : "다음 기회에 도전해주세요!"}
                </p>
              )}

              {!extraChanceUsed ? (
                <>
                  <p className="text-xs text-purple-600 mb-3 font-semibold">
                    당첨자 정보를 입력해주세요
                  </p>
                  <div className="space-y-2">
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

                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitOnly}
                        disabled={formLoading || !name || !phone}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-2 rounded-lg transition-all transform hover:scale-105 disabled:transform-none text-sm"
                      >
                        확인
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleExtraFormSubmit(e as any);
                        }}
                        disabled={formLoading || !name || !phone}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-2 rounded-lg transition-all transform hover:scale-105 disabled:transform-none text-sm"
                      >
                        {formLoading ? "처리 중..." : "한 번 더!"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    // 두 번째 참여가 완료된 경우 (event_participated 쿠키 확인)
                    const participated = Cookies.get('event_participated') === 'true';

                    if (participated) {
                      // 당첨 내역 페이지로 이동
                      setShowResultModal(false);
                      onShowResults?.();
                    } else {
                      // 첫 번째 당첨 후 정보 제출한 경우
                      setShowResultModal(false);
                    }
                  }}
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
