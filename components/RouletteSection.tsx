"use client";

import { useState, useEffect, useRef } from "react";
import { cookieUtils } from "@/lib/cookies";
import { getRouletteImages } from "@/lib/assets";
import Image from "next/image";

const SECTOR_ANGLES = {
  1: 45,
  2: 135,
  3: 225,
  4: 315,
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
  const [imageKey, setImageKey] = useState(Date.now());

  const isSpinningRef = useRef(false);

  const baseImages = getRouletteImages();
  const images = {
    front: `${baseImages.front}?t=${imageKey}`,
    back: `${baseImages.back}?t=${imageKey}`,
    arrow: `${baseImages.arrow}?t=${imageKey}`,
    button: `${baseImages.button}?t=${imageKey}`,
  };

  useEffect(() => {
    setHasParticipated(cookieUtils.hasParticipated());
  }, []);

  useEffect(() => {
    if (showResultModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showResultModal]);

  const handleSpinButtonClick = async () => {
    if (spinning || isSpinningRef.current) return;

    if (hasParticipated) {
      alert("이미 참여하셨습니다.");
      return;
    }

    await spinRoulette();
  };

  const spinRoulette = async () => {
    if (isSpinningRef.current || spinning) return;

    isSpinningRef.current = true;
    setSpinning(true);

    const initialRotation = rotation + 360 * 3;
    setRotation(initialRotation);

    try {
      const response = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        const targetSector = data.sector || 1;
        const targetAngle = SECTOR_ANGLES[targetSector as keyof typeof SECTOR_ANGLES];

        const additionalRotation = 360 * 2;
        const finalRotation = initialRotation + additionalRotation + (360 - targetAngle);

        setTimeout(() => {
          setRotation(finalRotation);
        }, 100);

        setTimeout(() => {
          setResult({
            prize: data.prize,
            message: data.message,
            sector: targetSector,
          });
          setShowResultModal(true);
          setSpinning(false);
          isSpinningRef.current = false;
          setHasParticipated(true);
        }, 4100);
      } else {
        alert(data.message);
        setSpinning(false);
        isSpinningRef.current = false;
      }
    } catch (err) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setSpinning(false);
      isSpinningRef.current = false;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12" style={{ backgroundColor: '#FF7BC3' }}>
      <div className="w-full max-w-lg text-center">
        <h2 className="text-4xl font-bold text-white mb-4 mt-8">룰렛 이벤트</h2>
        <p className="text-purple-100 mb-8">
          GO 버튼을 눌러 행운을 시험해보세요
        </p>

        {/* 룰렛 */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="relative w-full max-w-[450px] aspect-square">
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
            <div className="absolute inset-0 z-10">
              <Image
                src={images.back}
                alt="룰렛 뒷판"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
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

        {/* 유의사항 */}
        <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-left">
          <h3 className="text-lg font-bold text-white mb-4">유의사항</h3>
          <ul className="space-y-3 text-sm text-purple-100 leading-relaxed">
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-[340px] animate-slideUp">
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                축하합니다! {result.prize}
              </h3>
              <p className="text-lg font-semibold text-green-600 mb-2">
                {result.prize} 쿠폰 당첨
              </p>
              <p className="text-sm text-gray-500 mb-8">
                매장 직원에게 보여주세요.
              </p>
              <button
                onClick={() => setShowResultModal(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
