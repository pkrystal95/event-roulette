'use client';

import { useState } from 'react';
import { Step } from '@/types';
import PinInputSection from '@/components/PinInputSection';
import VideoSection from '@/components/VideoSection';
import RouletteSection from '@/components/RouletteSection';

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

  return (
    <main>
      {step === 'pin' && <PinInputSection onSuccess={handlePinSuccess} />}
      {step === 'video' && <VideoSection onComplete={handleVideoComplete} />}
      {step === 'roulette' && <RouletteSection />}
    </main>
  );
}
