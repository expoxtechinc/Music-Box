export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  duration: number; // in seconds
  genre: string;
  description: string;
  lyrics: string;
  plays: number;
  likesCount: number;
  sharesCount: number;
  uploadedBy: string;
  createdAt: any; // Firestore Timestamp
}

export interface Like {
  id: string;
  userId: string;
  trackId: string;
  createdAt: any; // Firestore Timestamp
}

export interface Comment {
  id: string;
  trackId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  content: string;
  createdAt: any; // Firestore Timestamp
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creatorId: string;
  creatorName: string;
  trackIds: string[];
  isPublic: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  history: Track[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
}
