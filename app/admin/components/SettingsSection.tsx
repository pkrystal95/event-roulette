'use client';

import { useState, useEffect } from 'react';

export default function SettingsSection() {
  const [adUrl, setAdUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pinStats, setPinStats] = useState<{ count: number; samplePins: string[] } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
    loadPinStats();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (data.success) {
        setAdUrl(data.settings.ad_url || '');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      showMessage('error', '설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadPinStats = async () => {
    try {
      const response = await fetch('/api/admin/pin-codes');
      const data = await response.json();

      if (data.success) {
        setPinStats({ count: data.count, samplePins: data.samplePins });
      }
    } catch (error) {
      console.error('Failed to load PIN stats:', error);
    }
  };

  const handleSave = async () => {
    if (!adUrl.trim()) {
      showMessage('error', '광고 URL을 입력해주세요.');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(adUrl);
    } catch {
      showMessage('error', '올바른 URL 형식이 아닙니다.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ad_url', value: adUrl }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', '광고 URL이 저장되었습니다.');
      } else {
        showMessage('error', data.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const showPinMessage = (type: 'success' | 'error', text: string) => {
    setPinMessage({ type, text });
    setTimeout(() => setPinMessage(null), 5000);
  };

  const handlePinFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      showPinMessage('error', 'Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/pin-codes', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showPinMessage('success', `PIN 코드 ${data.stats.unique}개가 업로드되었습니다. (중복 제거: ${data.stats.duplicates}개)`);
        loadPinStats(); // 통계 새로고침
      } else {
        showPinMessage('error', data.message || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to upload PIN file:', error);
      showPinMessage('error', '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      event.target.value = ''; // 파일 입력 초기화
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 광고 설정 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">광고 설정</h2>

        <div className="space-y-4">
        <div>
          <label htmlFor="ad-url" className="block text-sm font-medium text-gray-700 mb-2">
            광고 영상 URL
          </label>
          <input
            id="ad-url"
            type="url"
            value={adUrl}
            onChange={(e) => setAdUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            MP4 형식의 영상 URL을 입력해주세요. (예: https://example.com/video.mp4)
          </p>
        </div>

        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 미리보기 섹션 */}
        {adUrl && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">미리보기</h3>
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <video
                src={adUrl}
                controls
                className="w-full max-h-96 object-contain"
                controlsList="nodownload"
              >
                영상을 불러올 수 없습니다.
              </video>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* PIN 코드 관리 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">PIN 코드 관리</h2>

        <div className="space-y-4">
          {/* 현재 PIN 코드 통계 */}
          {pinStats && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-1">
                    현재 등록된 PIN 코드: {pinStats.count.toLocaleString()}개
                  </p>
                  <p className="text-sm text-blue-700">
                    샘플: {pinStats.samplePins.slice(0, 5).join(', ')}...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="pin-file" className="block text-sm font-medium text-gray-700 mb-2">
              PIN 코드 Excel 파일 업로드
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <input
                  id="pin-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handlePinFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </label>
              {uploading && (
                <div className="text-sm text-gray-600">업로드 중...</div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Excel 파일(.xlsx, .xls) 형식만 지원합니다.
              <br />
              첫 번째 시트에서 'P' + 6자리 숫자 형식의 PIN 코드를 자동으로 추출합니다.
              <br />
              <span className="text-orange-600 font-medium">⚠️ 업로드 시 기존 PIN 코드가 모두 교체됩니다.</span>
            </p>
          </div>

          {/* PIN 업로드 메시지 */}
          {pinMessage && (
            <div
              className={`p-4 rounded-lg ${
                pinMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {pinMessage.text}
            </div>
          )}

          {/* Excel 파일 형식 안내 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Excel 파일 형식 안내</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              <p className="mb-2">Excel 파일은 다음 컬럼명 중 하나를 포함해야 합니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>매장 코드</li>
                <li>PIN / pin / Pin</li>
                <li>CODE / code</li>
                <li>핀코드 / 핀 코드</li>
              </ul>
              <p className="mt-3 font-medium">PIN 형식: P + 6자리 숫자 (예: P160817, P036089)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
