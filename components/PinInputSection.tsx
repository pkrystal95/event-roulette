'use client';

import { useState } from 'react';

interface PinInputSectionProps {
  onSuccess: () => void;
}

export default function PinInputSection({ onSuccess }: PinInputSectionProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // PIN 코드 입력 핸들러 (P + 6자리 숫자)
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();

    // P로 시작하지 않으면 P 추가
    if (value && !value.startsWith('P')) {
      value = 'P' + value;
    }

    // P 제거 후 숫자만 추출
    const numbers = value.slice(1).replace(/[^\d]/g, '');

    // P + 최대 6자리 숫자
    const formatted = 'P' + numbers.slice(0, 6);

    setPin(formatted === 'P' ? '' : formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 7) {
      setError('PIN 코드는 P + 6자리 숫자입니다. (예: P123456)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message);
        setPin('');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-700 mb-6">
          QR 이벤트
        </h1>
        <p className="text-gray-600 mb-8">
          PIN 코드를 입력하고 이벤트에 참여하세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN 코드 입력 */}
          <div className="relative">
            <input
              type="text"
              value={pin}
              onChange={handlePinChange}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-center text-2xl sm:text-3xl font-bold tracking-widest focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all uppercase"
              placeholder="P000000"
              maxLength={7}
              disabled={loading}
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {pin.length}/7
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pin.length !== 7}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            {loading ? '확인 중...' : '시작하기'}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p className="font-semibold">PIN 코드 형식:</p>
          <p>• P로 시작하는 7자리 코드</p>
          <p>• 예시: P123456</p>
        </div>
      </div>
    </div>
  );
}
