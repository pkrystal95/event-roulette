'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrizesSection from './components/PrizesSection';
import ProbabilitySection from './components/ProbabilitySection';
import FilesSection from './components/FilesSection';
import ParticipantsSection from './components/ParticipantsSection';
import SettingsSection from './components/SettingsSection';

type Tab = 'prizes' | 'probability' | 'files' | 'participants' | 'settings';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // URL에서 tab 파라미터 읽기 (클라이언트 사이드)
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as Tab;
      if (tab && ['prizes', 'probability', 'files', 'participants', 'settings'].includes(tab)) {
        return tab;
      }
    }
    return 'prizes';
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check-auth');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    } catch (err) {
      router.push('/admin/login');
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              룰렛 이벤트 관리자
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange('prizes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'prizes'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              경품 관리
            </button>
            <button
              onClick={() => handleTabChange('probability')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'probability'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              확률 관리
            </button>
            <button
              onClick={() => handleTabChange('files')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'files'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              파일 관리
            </button>
            <button
              onClick={() => handleTabChange('participants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'participants'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              당첨 결과
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              광고 설정
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prizes' && <PrizesSection />}
        {activeTab === 'probability' && <ProbabilitySection />}
        {activeTab === 'files' && <FilesSection />}
        {activeTab === 'participants' && <ParticipantsSection />}
        {activeTab === 'settings' && <SettingsSection />}
      </main>
    </div>
  );
}
