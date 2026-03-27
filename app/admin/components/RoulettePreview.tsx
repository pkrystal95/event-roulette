'use client';

import { useState, useEffect } from 'react';
import { getRouletteImages } from '@/lib/assets';
import Image from 'next/image';

interface RoulettePreviewProps {
  refreshKey?: number;
}

// 각 섹터의 타겟 각도 (12시 방향이 0도)
const SECTOR_ANGLES = {
  1: 45,  // 0~90도
  2: 135, // 90~180도
  3: 225, // 180~270도
  4: 315, // 270~360도
};

interface Prize {
  id: string;
  name: string;
  sector: number;
  weight: number;
  is_active: boolean;
}

export default function RoulettePreview({ refreshKey = 0 }: RoulettePreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [images, setImages] = useState(getRouletteImages());
  const [imageKey, setImageKey] = useState(Date.now());
  const [spinning, setSpinning] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  // refreshKey가 변경되면 이미지 다시 로드
  useEffect(() => {
    setImages(getRouletteImages());
    setImageKey(Date.now());
  }, [refreshKey]);

  // 경품 정보 가져오기
  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      const response = await fetch('/api/admin/prizes');
      const data = await response.json();
      if (data.success) {
        setPrizes(data.prizes || []);
      }
    } catch (error) {
      console.error('Failed to fetch prizes:', error);
    }
  };

  const handleTestSpin = () => {
    const randomRotation = Math.floor(Math.random() * 360) + 360 * 5;
    setRotation(rotation + randomRotation);
  };

  // 특정 섹터로 회전
  const handleSectorTest = (sector: number) => {
    if (spinning) return;

    setSpinning(true);
    const targetAngle = SECTOR_ANGLES[sector as keyof typeof SECTOR_ANGLES];

    // 현재 각도 (0-360)
    const currentAngle = rotation % 360;
    // 목표 최종 각도 (화살표 위치에 맞추기 위해 360 - targetAngle)
    const targetFinalAngle = 360 - targetAngle;

    // 현재 위치에서 목표 위치까지 최단 거리 계산
    let angleDiff = targetFinalAngle - currentAngle;
    if (angleDiff < 0) angleDiff += 360;

    // 5바퀴 + 목표 각도까지 회전
    const finalRotation = rotation + 360 * 5 + angleDiff;
    setRotation(finalRotation);

    // 4초 후 spinning 상태 해제
    setTimeout(() => {
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">룰렛 미리보기</h3>
      <p className="text-sm text-gray-600 mb-4">
        현재 업로드된 이미지로 룰렛이 어떻게 표시되는지 확인하세요.
      </p>

      <div className="flex flex-col items-center">
        {/* 룰렛 */}
        <div className="relative w-full max-w-[350px] aspect-square mb-4">
          {/* 화살표 (고정) */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30">
            <div className="relative w-8 h-8">
              <Image
                src={`${images.arrow}?t=${imageKey}`}
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
              src={`${images.back}?t=${imageKey}`}
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
              transition: 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
            }}
          >
            <Image
              src={`${images.front}?t=${imageKey}`}
              alt="룰렛 앞판"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* GO 버튼 */}
          <button
            onClick={handleTestSpin}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] z-30 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src={`${images.button}?t=${imageKey}`}
              alt="GO 버튼"
              fill
              className="object-contain"
              unoptimized
            />
          </button>
        </div>

        {/* 테스트 버튼 */}
        <div className="w-full max-w-[350px] space-y-3">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-2">섹터별 테스트</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((sector) => {
                const prize = prizes.find(p => p.sector === sector);
                return (
                  <div key={sector} className="flex flex-col gap-1">
                    {prize && (
                      <div className="text-xs text-gray-600 truncate px-1" title={prize.name}>
                        {prize.name}
                      </div>
                    )}
                    <button
                      onClick={() => handleSectorTest(sector)}
                      disabled={spinning}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                    >
                      섹터 {sector}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleTestSpin}
            disabled={spinning}
            className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {spinning ? '회전 중...' : '랜덤 테스트 회전'}
          </button>
        </div>
      </div>
    </div>
  );
}
