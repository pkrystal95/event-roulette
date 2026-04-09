'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoSectionProps {
  onComplete: () => void;
}

export default function VideoSection({ onComplete }: VideoSectionProps) {
  const [videoWatched, setVideoWatched] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watchedTime, setWatchedTime] = useState(0);
  const [adUrl, setAdUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchedTimeRef = useRef(0);

  useEffect(() => {
    // 설정에서 광고 URL 로드 후 비디오 재생
    const loadAdUrl = async () => {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' });
        const data = await response.json();
        if (data.success && data.settings.ad_url) {
          setAdUrl(data.settings.ad_url);
        } else {
          setAdUrl('https://www.w3schools.com/html/mov_bbb.mp4');
        }
      } catch (error) {
        console.error('Failed to load ad URL:', error);
        setAdUrl('https://www.w3schools.com/html/mov_bbb.mp4');
      }
    };

    loadAdUrl();

    // 60초(1분) 후 건너뛰기 버튼 활성화
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 60000);

    return () => clearTimeout(skipTimer);
  }, []);

  // adUrl이 설정된 후 비디오 로드 및 재생
  useEffect(() => {
    if (adUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.log('Autoplay failed:', err);
      });
    }
  }, [adUrl]);

  // 시간 업데이트 추적 - 시크바 조작 방지
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;

      // 현재 시간이 최대 시청 시간보다 크면 업데이트
      if (currentTime > maxWatchedTimeRef.current) {
        maxWatchedTimeRef.current = currentTime;
        setWatchedTime(currentTime);
      } else {
        // 앞으로 건너뛰려고 하면 최대 시청 지점으로 되돌림
        videoRef.current.currentTime = maxWatchedTimeRef.current;
      }
    }
  };

  // 시크 시도 감지 - 앞으로 건너뛰기 방지
  const handleSeeking = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;

      // 앞으로 건너뛰려고 하면 최대 시청 지점으로 되돌림
      if (currentTime > maxWatchedTimeRef.current) {
        videoRef.current.currentTime = maxWatchedTimeRef.current;
      }
    }
  };

  const handleVideoEnd = () => {
    setVideoWatched(true);
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      await fetch('/api/video-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      onComplete();
    } catch (err) {
      console.error('Video complete error:', err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* 비디오 */}
      {adUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          muted
          playsInline
          onEnded={handleVideoEnd}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        >
          <source src={adUrl} type="video/mp4" />
          영상을 불러올 수 없습니다.
        </video>
      ) : (
        <div className="text-white text-sm">영상 로딩 중...</div>
      )}

      {/* 1분 후 건너뛰기 버튼 (우측 상단) */}
      {canSkip && !videoWatched && (
        <button
          onClick={handleContinue}
          disabled={loading}
          className="absolute top-6 right-6 bg-black bg-opacity-70 hover:bg-opacity-90 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all font-bold text-sm backdrop-blur-sm border border-white border-opacity-30 animate-fadeIn"
        >
          {loading ? '처리 중...' : (
            <>
              건너뛰기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      )}

      {/* 영상 종료 후 다음 단계 버튼 (중앙 하단) */}
      {videoWatched && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-slideUp">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-full transition-all transform hover:scale-105 shadow-2xl text-base sm:text-lg whitespace-nowrap"
          >
            {loading ? '처리 중...' : '룰렛 참여 →'}
          </button>
        </div>
      )}

      {/* 하단 진행 안내 (영상이 끝나지 않았을 때만) */}
      {!videoWatched && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-xs sm:text-sm bg-black bg-opacity-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full backdrop-blur-sm text-center max-w-[90vw]">
          {canSkip ? '건너뛰거나 끝까지 시청해주세요' : '영상 종료 후 룰렛 페이지로 이동'}
        </div>
      )}
    </div>
  );
}
