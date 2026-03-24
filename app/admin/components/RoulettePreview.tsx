'use client';

import { useState, useEffect } from 'react';
import { getRouletteImages } from '@/lib/assets';
import Image from 'next/image';

interface RoulettePreviewProps {
  refreshKey?: number;
}

export default function RoulettePreview({ refreshKey = 0 }: RoulettePreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [images, setImages] = useState(getRouletteImages());
  const [imageKey, setImageKey] = useState(Date.now());

  // refreshKey가 변경되면 이미지 다시 로드
  useEffect(() => {
    setImages(getRouletteImages());
    setImageKey(Date.now());
  }, [refreshKey]);

  const handleTestSpin = () => {
    const randomRotation = Math.floor(Math.random() * 360) + 360 * 5;
    setRotation(rotation + randomRotation);
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

        <button
          onClick={handleTestSpin}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          테스트 회전
        </button>
      </div>

      {/* 이미지 URL 정보 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">사용 중인 이미지</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>앞판:</span>
            <span className="truncate ml-2">{images.front}</span>
          </div>
          <div className="flex justify-between">
            <span>뒷판:</span>
            <span className="truncate ml-2">{images.back}</span>
          </div>
          <div className="flex justify-between">
            <span>화살표:</span>
            <span className="truncate ml-2">{images.arrow}</span>
          </div>
          <div className="flex justify-between">
            <span>버튼:</span>
            <span className="truncate ml-2">{images.button}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
