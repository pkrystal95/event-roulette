'use client';

interface ResultSectionProps {
  prize: string;
  message: string;
  canUseExtraChance: boolean;
  onExtraChance: () => void;
}

export default function ResultSection({
  prize,
  message,
  canUseExtraChance,
  onExtraChance,
}: ResultSectionProps) {
  const isWinner = !prize.includes('꽝');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          {isWinner ? (
            <div className="text-6xl mb-4">🎉</div>
          ) : (
            <div className="text-6xl mb-4">😢</div>
          )}

          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            {isWinner ? '축하합니다!' : '아쉽네요...'}
          </h2>

          <div className={`text-2xl font-bold mb-4 ${
            isWinner ? 'text-green-600' : 'text-gray-600'
          }`}>
            {prize}
          </div>

          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {!isWinner && canUseExtraChance && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3 text-center">
              정보 입력 시 1회 추가 기회를 드립니다!
            </p>
            <button
              onClick={onExtraChance}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              추가 참여하기
            </button>
          </div>
        )}

        {!canUseExtraChance && !isWinner && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              모든 참여 기회를 사용하셨습니다.
            </p>
          </div>
        )}

        {isWinner && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              당첨 결과는 등록하신 연락처로 안내드립니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
