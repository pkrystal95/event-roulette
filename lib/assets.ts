// 룰렛 이미지 URL을 가져오는 유틸리티
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const BUCKET_NAME = 'roulette-assets';

// Supabase Storage에서 이미지 URL 생성
export function getAssetUrl(fileName: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
}

// 룰렛 이미지 파일명
export const ROULETTE_ASSETS = {
  FRONT: 'front.png',
  BACK: 'back.png',
  ARROW: 'arrow.png',
  BUTTON: 'button.png',
} as const;

// 룰렛 이미지 URL 가져오기
export const getRouletteImages = () => ({
  front: getAssetUrl(ROULETTE_ASSETS.FRONT),
  back: getAssetUrl(ROULETTE_ASSETS.BACK),
  arrow: getAssetUrl(ROULETTE_ASSETS.ARROW),
  button: getAssetUrl(ROULETTE_ASSETS.BUTTON),
});
