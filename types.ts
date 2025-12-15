
export enum ViewMode {
  THE_GARDEN = 'THE GARDEN',
  MEMORY = 'MEMORY',
  MUSIC = 'MUSIC',
  INFO = 'INFO'
}

export interface ParticleConfig {
  size: number;
  speed: number;
  dispersion: number; // How spread out the particles are
  noiseStrength: number; // Chaos factor
  colorHex: string;
}

export type PhilosopherId = 'hegel' | 'williams' | 'husserl';

export interface Philosopher {
  id: PhilosopherId;
  name: string;
  nameCh: string;
  desc: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Memory {
  id: string;
  philosopherId: PhilosopherId;
  philosopherName: string;
  title: string;
  body: string; 
  date: string; 
  timestamp: number;
  originalTranscript: string; 
  imageSrc?: string; // New: Image associated with memory
}

export interface Track {
  title: string;
  url: string;
  isLocal?: boolean;
}

export type PlaybackMode = 'SEQUENCE' | 'RANDOM' | 'LOOP';
