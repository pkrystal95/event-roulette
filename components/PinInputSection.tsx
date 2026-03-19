'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';

interface PinInputSectionProps {
  onSuccess: () => void;
}

export default function PinInputSection({ onSuccess }: PinInputSectionProps) {
  const [pins, setPins] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // 마지막 입력된 문자만 가져오기 (붙여넣기나 자동완성 대응)
    const lastChar = value.slice(-1);

    // 숫자만 입력 허용
    if (lastChar && !/^\d$/.test(lastChar)) return;

    const newPins = [...pins];
    newPins[index] = lastChar;
    setPins(newPins);

    // 값이 입력되면 다음 입력란으로 포커스 이동
    if (lastChar && index < 3) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }

    // 4자리 모두 입력되면 자동 제출
    if (index === 3 && lastChar) {
      const fullPin = newPins.join('');
      if (fullPin.length === 4) {
        setTimeout(() => {
          handleSubmit(fullPin);
        }, 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // 백스페이스 키 처리
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);

    if (/^\d+$/.test(pastedData)) {
      const newPins = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setPins(newPins);

      // 마지막 입력란으로 포커스 이동
      const lastIndex = Math.min(pastedData.length, 3);
      inputRefs.current[lastIndex]?.focus();

      // 4자리 모두 입력되면 자동 제출
      if (pastedData.length === 4) {
        handleSubmit(pastedData);
      }
    }
  };

  const handleSubmit = async (pin?: string) => {
    const fullPin = pin || pins.join('');

    if (fullPin.length < 4) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message);
        // 에러 시 입력란 초기화
        setPins(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setPins(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
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

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* PIN 입력란 4개 */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {pins.map((pin, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-gray-300 rounded-lg text-center text-2xl sm:text-3xl font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                maxLength={1}
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pins.join('').length < 4}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            {loading ? '확인 중...' : '시작하기'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6">
          테스트 PIN: 1234, 5678, 9999
        </p>
      </div>
    </div>
  );
}
