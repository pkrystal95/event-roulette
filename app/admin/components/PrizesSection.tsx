'use client';

import { useState, useEffect } from 'react';

interface Prize {
  id: string;
  name: string;
  message: string;
  sector: number;
  weight: number;
  is_active: boolean;
}

export default function PrizesSection() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    sector: 1,
    weight: 0,
    is_active: true,
  });

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

  const handleAdd = () => {
    setEditingPrize(null);
    setFormData({
      name: '',
      message: '',
      sector: 1,
      weight: 0,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      message: prize.message,
      sector: prize.sector,
      weight: prize.weight,
      is_active: prize.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingPrize ? 'PUT' : 'POST';
      const body = editingPrize
        ? { id: editingPrize.id, ...formData }
        : formData;

      const response = await fetch('/api/admin/prizes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setShowModal(false);
        fetchPrizes();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('작업 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/prizes?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchPrizes();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">경품 관리</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          + 경품 추가
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                섹터
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                메시지
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                확률 (Weight)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prizes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  등록된 경품이 없습니다.
                </td>
              </tr>
            ) : (
              prizes.map((prize) => (
                <tr key={prize.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prize.sector}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prize.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {prize.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prize.weight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prize.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {prize.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(prize)}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPrize ? '경품 수정' : '경품 추가'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품명
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  섹터 (1-6)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (확률)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  활성화
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  {editingPrize ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
