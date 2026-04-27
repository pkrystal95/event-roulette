'use client';

import { useState } from 'react';
import PinInputSection from '@/components/PinInputSection';
import VideoSection from '@/components/VideoSection';
import RouletteSection from '@/components/RouletteSection';

export default function Home() {
  const [step, setStep] = useState<'pin' | 'video' | 'roulette'>('pin');

  const handlePinSuccess = () => {
    setStep('video');
  };

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
