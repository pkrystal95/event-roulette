import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR 이벤트 - 룰렛 이벤트',
  description: '영상 시청 후 룰렛을 돌려 경품을 받아가세요!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
