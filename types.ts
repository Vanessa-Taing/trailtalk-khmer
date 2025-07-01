export type PronunciationMethod = 'auto' | 'manual' | false;

export type CorrectStatus = { [key: number]: { en: PronunciationMethod; km: PronunciationMethod } };

export interface WordPair {
  id: number;
  english: string;
  khmer: string;
  phonetic?: string;
  englishMeaning?: string;
  khmerMeaning?: string;
  category?: string;
}

export interface PhrasePair {
  id: number;
  english: string;
  khmer: string;
  category: string;
}

export interface Idea {
  id: number;
  text: string;
  status: 'new' | 'accepted' | 'rejected';
  timestamp: number;
}

export type User = {
  email: string;
  isPremium: boolean;
};

export type UserProgress = {
  correctlyPronounced: CorrectStatus;
  alreadyLearntWordsIds: number[];
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  registrationDate: string;
  paymentAmount: string;
  paymentDate: string;
  transactionId: string;
};