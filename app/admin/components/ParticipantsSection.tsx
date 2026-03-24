'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Participant {
  id: string;
  name: string;
  phone: string;
  first_result: string;
  second_result: string | null;
  is_winner: boolean;
  created_at: string;
}

export default function ParticipantsSection() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [prizeFilter, setPrizeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchParticipants();
  }, [page, search, prizeFilter, startDate, endDate]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(prizeFilter && { prize: prizeFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/admin/participants?${params}`);
      const data = await response.json();

      if (data.success) {
        setParticipants(data.participants || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchParticipants();
  };

  const handleExcelDownload = async () => {
    try {
      // 전체 데이터 조회
      const response = await fetch('/api/admin/participants', {
        method: 'POST',
      });
      const data = await response.json();

      if (!data.success) {
        alert('데이터 조회 실패');
        return;
      }

      const participants = data.participants;

      // 엑셀 데이터 준비
      const excelData = participants.map((p: Participant) => ({
        이름: p.name,
        전화번호: p.phone,
        '1차 결과': p.first_result,
        '2차 결과': p.second_result || '-',
        당첨여부: p.is_winner ? '당첨' : '미당첨',
        참여일시: new Date(p.created_at).toLocaleString('ko-KR'),
      }));

      // 워크북 생성
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '당첨자 목록');

      // 파일 다운로드
      const fileName = `당첨자목록_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Excel download error:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 참가자를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/participants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (data.success) {
        alert('삭제되었습니다.');
        fetchParticipants(); // 목록 새로고침
      } else {
        alert(data.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">당첨 결과</h2>
            <p className="text-sm text-gray-600 mt-1">총 {total}명의 참가자</p>
          </div>
          <button
            onClick={handleExcelDownload}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 검색 & 필터 */}
      <div className="px-6 py-4 border-b border-gray-200 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호 검색"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select
            value={prizeFilter}
            onChange={(e) => {
              setPrizeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="">전체 경품</option>
            <option value="아메리카노">아메리카노</option>
            <option value="간식">간식</option>
            <option value="도어캠 6개월 무료">도어캠 6개월 무료</option>
            <option value="설치비 무료">설치비 무료</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            검색
          </button>
        </div>

        {/* 날짜 필터 */}
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">참여일자:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <span className="text-gray-500">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              날짜 초기화
            </button>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                전화번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                1차 결과
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                2차 결과
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                당첨여부
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                참여일시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : participants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              participants.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.first_result}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {participant.second_result || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        participant.is_winner
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {participant.is_winner ? '당첨' : '미당첨'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(participant.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(participant.id, participant.name)}
                      className="text-red-600 hover:text-red-800 font-medium"
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
