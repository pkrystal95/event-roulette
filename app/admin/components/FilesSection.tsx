'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import RoulettePreview from './RoulettePreview';
import { getRouletteImages, ROULETTE_ASSETS } from '@/lib/assets';

interface ImageSlot {
  key: string;
  label: string;
  fileName: string;
  description: string;
}

const IMAGE_SLOTS: ImageSlot[] = [
  {
    key: 'front',
    label: '앞판 (회전)',
    fileName: ROULETTE_ASSETS.FRONT,
    description: '경품이 표시된 회전하는 원판',
  },
  {
    key: 'back',
    label: '뒷판 (고정)',
    fileName: ROULETTE_ASSETS.BACK,
    description: '룰렛의 배경판',
  },
  {
    key: 'arrow',
    label: '화살표',
    fileName: ROULETTE_ASSETS.ARROW,
    description: '당첨 위치를 가리키는 화살표',
  },
  {
    key: 'button',
    label: 'GO 버튼',
    fileName: ROULETTE_ASSETS.BUTTON,
    description: '룰렛을 돌리는 버튼',
  },
];

export default function FilesSection() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [images, setImages] = useState(getRouletteImages());
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const handleImageUpload = async (slot: ImageSlot, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(slot.key);

    try {
      // 파일명을 고정된 이름으로 변경
      const blob = new Blob([file], { type: file.type });
      const fixedFile = new File([blob], slot.fileName, { type: file.type });

      const formData = new FormData();
      formData.append('file', fixedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // 업로드 성공 시 즉시 미리보기 갱신
        setRefreshKey((prev) => prev + 1);
        setImages(getRouletteImages());
        setHasChanges(true);
      } else {
        alert(data.message || '업로드 실패');
      }
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleApplyChanges = () => {
    // 변경사항 플래그 제거
    setHasChanges(false);
    alert('이미지가 적용되었습니다.\n메인 페이지를 새로고침하면 변경된 이미지를 확인할 수 있습니다.');
  };

  return (
    <div className="space-y-6">
      {/* 룰렛 미리보기 */}
      <RoulettePreview key={refreshKey} />

      {/* 이미지 관리 */}
      <div className="bg-white rounded-lg shadow">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">룰렛 이미지 관리</h2>
              <p className="text-sm text-gray-600 mt-1">
                각 이미지를 클릭하여 교체할 수 있습니다. (권장: PNG 형식, 투명 배경)
              </p>
            </div>
            {hasChanges && (
              <button
                onClick={handleApplyChanges}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors animate-pulse"
              >
                변경사항 적용
              </button>
            )}
          </div>
        </div>

        {/* 이미지 슬롯 그리드 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {IMAGE_SLOTS.map((slot) => {
              const imageUrl = images[slot.key as keyof typeof images];
              const isUploading = uploading === slot.key;

              return (
                <div
                  key={slot.key}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  {/* 슬롯 헤더 */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{slot.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{slot.description}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {slot.fileName}
                    </span>
                  </div>

                  {/* 이미지 미리보기 */}
                  <div className="relative w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        key={refreshKey}
                        src={`${imageUrl}?t=${Date.now()}`}
                        alt={slot.label}
                        fill
                        className="object-contain p-4"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* 업로드 버튼 */}
                  <label className="block">
                    <input
                      type="file"
                      onChange={(e) => handleImageUpload(slot, e)}
                      className="hidden"
                      accept="image/*"
                      disabled={isUploading}
                    />
                    <div
                      className={`w-full py-2 px-4 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                        isUploading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {isUploading ? '업로드 중...' : '이미지 교체'}
                    </div>
                  </label>

                  {/* 다운로드 버튼 */}
                  {imageUrl && (
                    <a
                      href={imageUrl}
                      download={slot.fileName}
                      className="block mt-2 w-full py-2 px-4 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      다운로드
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📌 이미지 업로드 가이드</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 권장 형식: PNG (투명 배경 지원)</li>
            <li>• 권장 크기: 앞판/뒷판 500x500px, 화살표 80x80px, 버튼 120x120px</li>
            <li>• 파일명은 자동으로 고정됩니다 (front.png, back.png, arrow.png, button.png)</li>
            <li>• 이미지를 교체하면 기존 이미지를 덮어씁니다</li>
            <li>• 업로드 후 미리보기에서 즉시 확인 가능합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
