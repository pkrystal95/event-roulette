"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface Results {
  name: string;
  phone: string;
  firstResult: string;
  secondResult: string | null;
  isWinner: boolean;
  createdAt: string;
}

interface MyResultsSectionProps {
  onBackToRoulette?: () => void;
}

export default function MyResultsSection({
  onBackToRoulette,
}: MyResultsSectionProps) {
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const phone = Cookies.get("event_phone");

        if (!phone) {
          setError("전화번호 정보를 찾을 수 없습니다.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/my-results?phone=${encodeURIComponent(phone)}`,
        );
        const data = await response.json();

        if (data.success) {
          setResults(data.results);
        } else {
          setError(data.message || "참여 내역을 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("결과 조회 오류:", err);
        setError("서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getPrizeIcon = (prize: string) => {
    if (prize === "꽝") return "😢";
    return "🎁";
  };

  const getPrizeColor = (prize: string) => {
    if (prize === "꽝") return "text-gray-500";
    return "text-yellow-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-white text-2xl">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">오류</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">참여 완료!</h1>
          <p className="text-gray-600">{results.name}님의 참여 내역입니다</p>
        </div>

        {/* 참여 정보 */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">이름</span>
            <span className="font-semibold text-gray-800">{results.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">전화번호</span>
            <span className="font-semibold text-gray-800">{results.phone}</span>
          </div>
        </div>

        {/* 최종 결과 (2차가 있으면 2차, 없으면 1차) */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center mb-2">
            <span
              className={`text-3xl ${getPrizeIcon(results.secondResult || results.firstResult)}`}
            >
              {getPrizeIcon(results.secondResult || results.firstResult)}
            </span>
          </div>
          <div
            className={`text-2xl font-bold text-center ${getPrizeColor(results.secondResult || results.firstResult)}`}
          >
            {results.secondResult || results.firstResult}
          </div>
        </div>

        {/* 당첨 여부 */}
        <div
          className={`rounded-2xl p-6 mb-6 text-center ${
            results.isWinner
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : "bg-gradient-to-r from-gray-400 to-gray-500"
          }`}
        >
          <div className="text-white">
            <div className="text-4xl mb-3">
              {results.isWinner ? "🎊" : "😊"}
            </div>
            <div className="text-2xl font-bold mb-2">
              {results.isWinner ? "축하합니다!" : "아쉽지만..."}
            </div>
            <div className="text-lg">
              {results.isWinner
                ? "경품에 당첨되셨습니다!"
                : "다음 기회에 도전해 주세요!"}
            </div>
          </div>
        </div>

        {/* 참여 일시 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          참여 일시: {new Date(results.createdAt).toLocaleString("ko-KR")}
        </div>

        {/* 룰렛으로 돌아가기 버튼 */}
        {onBackToRoulette && (
          <button
            onClick={onBackToRoulette}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            룰렛으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}
