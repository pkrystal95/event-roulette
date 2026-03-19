export type Step = 'pin' | 'video' | 'roulette';

export interface EventState {
  step: Step;
  videoWatched: boolean;
  hasParticipated: boolean;
  extraChanceUsed: boolean;
}

export interface PrizeResult {
  prize: string;
  message: string;
}

export interface ExtraChanceForm {
  name: string;
  phone: string;
}
