export interface Player {
  id: number;
  name: string;
  mobile: string;
  email?: string | null;
  created_at?: string;
  highest_score?: number;
  total_games?: number;
}

export interface ScoreSubmission {
  player_id: number;
  score: number;
  popsicles_caught: number;
  duration_seconds: number;
}

export interface ScoreRecord {
  id: number;
  user_id: number;
  user?: Player;
  score: number;
  popsicles_caught: number;
  duration_seconds: number;
  created_at: string;
}

export type PopsicleType = 'chocobar' | 'berry_rocket' | 'mango_pop' | 'twister' | 'wonder_cone' | 'golden_star';

export interface PopsicleItem {
  id: string;
  type: PopsicleType;
  x: number; // 0 to 1 normalized or canvas pixels
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  points: number;
  caught: boolean;
  opacity: number;
  flavorName: string;
  color: string;
}

export interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface FaceMouthState {
  isDetected: boolean;
  mouthCenter: { x: number; y: number }; // Canvas pixel coords
  mouthWidth: number;
  mouthHeight: number;
  mar: number; // Mouth aspect ratio
  isTongueOut: boolean;
  tongueTip?: { x: number; y: number };
  rawLandmarks?: Array<{ x: number; y: number; z: number }>;
}

export interface AdminStats {
  total_users: number;
  total_games: number;
  today_games: number;
  highest_score: number;
  average_score: number;
  maintenance_mode?: boolean;
  maintenance_message?: string;
}

export interface GameStatus {
  success: boolean;
  maintenance_mode: boolean;
  maintenance_message?: string;
}

