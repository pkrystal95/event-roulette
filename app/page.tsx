'use client';

import { useState } from 'react';
import { Step } from '@/types';
import PinInputSection from '@/components/PinInputSection';
import VideoSection from '@/components/VideoSection';
import RouletteSection from '@/components/RouletteSection';
import MyResultsSection from '@/components/MyResultsSection';

export default function Home() {
  const [step, setStep] = useState<Step>('pin');

  // PIN 입력 성공
  const handlePinSuccess = () => {
    setStep('video');
  };

  // 영상 시청 완료
  const handleVideoComplete = () => {
    setStep('roulette');
  };

  // 당첨 내역 페이지로 이동
  const handleShowResults = () => {
    setStep('results');
  };

  return (
    <main>
      {step === 'pin' && <PinInputSection onSuccess={handlePinSuccess} />}
      {step === 'video' && <VideoSection onComplete={handleVideoComplete} />}
      {step === 'roulette' && <RouletteSection onShowResults={handleShowResults} />}
      {step === 'results' && <MyResultsSection />}
    </main>
  );
}
