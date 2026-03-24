'use client';

import { useState, useEffect } from 'react';

interface Prize {
  id: string;
  name: string;
  sector: number;
  weight: number;
}

export default function ProbabilitySection() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (id: string, newWeight: number) => {
    setPrizes(
      prizes.map((prize) =>
        prize.id === id ? { ...prize, weight: newWeight } : prize
      )
    );
  };

  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);

  const handleSave = async () => {
    if (totalWeight !== 100) {
      alert('확률의 합계는 100이어야 합니다!');
      return;
    }

    setSaving(true);

    try {
      // 각 경품의 확률을 개별적으로 업데이트
      const updatePromises = prizes.map((prize) =>
        fetch('/api/admin/prizes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: prize.id,
            name: prize.name,
            sector: prize.sector,
            weight: prize.weight,
          }),
        })
      );

      await Promise.all(updatePromises);
      alert('확률이 저장되었습니다!');
      fetchPrizes();
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">확률 관리</h2>
        <p className="text-sm text-gray-600 mt-1">
          각 경품의 당첨 확률을 조정하세요. 총 합계는 100%여야 합니다.
        </p>
      </div>

      {/* 확률 조정 */}
      <div className="p-6 space-y-6">
        {prizes.map((prize) => {
          const percentage = totalWeight > 0 ? (prize.weight / totalWeight) * 100 : 0;

          return (
            <div key={prize.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">
                    {prize.name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    (섹터 {prize.sector})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-purple-600">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={prize.weight}
                  onChange={(e) =>
                    handleWeightChange(prize.id, parseFloat(e.target.value))
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={prize.weight}
                  onChange={(e) =>
                    handleWeightChange(prize.id, parseFloat(e.target.value) || 0)
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-center"
                />
              </div>
            </div>
          );
        })}

        {/* 총 합계 */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">총 합계</span>
            <span
              className={`text-2xl font-bold ${
                totalWeight === 100
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {totalWeight.toFixed(1)}%
            </span>
          </div>
          {totalWeight !== 100 && (
            <p className="text-sm text-red-600 mt-2">
              확률의 합계가 100%가 아닙니다. 저장할 수 없습니다.
            </p>
          )}
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving || totalWeight !== 100}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? '저장 중...' : '확률 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
