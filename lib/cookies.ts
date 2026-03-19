import Cookies from 'js-cookie';

const COOKIE_KEYS = {
  PARTICIPATED: 'event_participated',
  EXTRA_CHANCE_USED: 'event_extra_chance_used',
  VIDEO_COMPLETED: 'event_video_completed',
} as const;

export const cookieUtils = {
  // 참여 여부 확인
  hasParticipated(): boolean {
    return Cookies.get(COOKIE_KEYS.PARTICIPATED) === 'true';
  },

  // 참여 완료 설정
  setParticipated(): void {
    Cookies.set(COOKIE_KEYS.PARTICIPATED, 'true', { expires: 365 });
  },

  // 추가 기회 사용 여부 확인
  hasUsedExtraChance(): boolean {
    return Cookies.get(COOKIE_KEYS.EXTRA_CHANCE_USED) === 'true';
  },

  // 추가 기회 사용 설정
  setExtraChanceUsed(): void {
    Cookies.set(COOKIE_KEYS.EXTRA_CHANCE_USED, 'true', { expires: 365 });
  },

  // 영상 시청 완료 여부 확인
  hasCompletedVideo(): boolean {
    return Cookies.get(COOKIE_KEYS.VIDEO_COMPLETED) === 'true';
  },

  // 영상 시청 완료 설정
  setVideoCompleted(): void {
    Cookies.set(COOKIE_KEYS.VIDEO_COMPLETED, 'true', { expires: 1 });
  },

  // 모든 쿠키 초기화 (테스트용)
  clearAll(): void {
    Cookies.remove(COOKIE_KEYS.PARTICIPATED);
    Cookies.remove(COOKIE_KEYS.EXTRA_CHANCE_USED);
    Cookies.remove(COOKIE_KEYS.VIDEO_COMPLETED);
  },
};
