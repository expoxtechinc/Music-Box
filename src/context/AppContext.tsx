import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "../firebase";
import { Track, UserProfile, Playlist, Comment, Like } from "../types";
import { SAMPLE_TRACKS } from "../data/mockSongs";

interface AppContextProps {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loadingAuth: boolean;
  tracks: Track[];
  loadingTracks: boolean;
  activeTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track, fromQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  queue: Track[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  seek: (time: number) => void;
  changeVolume: (vol: number) => void;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  seedTracks: () => Promise<void>;
  toggleLikeTrack: (trackId: string) => Promise<void>;
  isLiked: (trackId: string) => boolean;
  recordShare: (trackId: string) => Promise<void>;
  addComment: (trackId: string, content: string) => Promise<void>;
  deleteComment: (trackId: string, commentId: string) => Promise<void>;
  getTrackComments: (trackId: string, callback: (comments: Comment[]) => void) => () => void;
  createPlaylist: (title: string, description: string, isPublic: boolean, coverUrl?: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  playlists: Playlist[];
  authError: { code: string; message: string; host: string } | null;
  clearAuthError: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<{ code: string; message: string; host: string } | null>(null);
  const clearAuthError = () => setAuthError(null);

  // Tracks listing (Realtime or simulated fallback list)
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  // Saved bookmark "likes" state
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);

  // Users playlists
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Music Player States
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Bootstrap Auth Lifecycle State Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Safe document fetch with structural handles
        const uDocPath = `users/${currentUser.uid}`;
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Profile is not created yet, seed user profile securely
            const profile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "Audiomack Fan",
              photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`,
              isAdmin: currentUser.email === "borborschool.admin@gmail.com",
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", currentUser.uid), profile);
            setUserProfile(profile);
          }
        } catch (err) {
          console.error("Error setting up user profile document: ", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubAuth();
  }, []);

  // Fetch Tracks (Real-time listener)
  useEffect(() => {
    const tracksCollection = collection(db, "tracks");
    const q = query(tracksCollection, orderBy("createdAt", "desc"));
    
    const unsubTracks = onSnapshot(q, (snapshot) => {
      const fetchedTracks: Track[] = [];
      snapshot.forEach((doc) => {
        fetchedTracks.push({ ...doc.data(), id: doc.id } as Track);
      });
      
      if (fetchedTracks.length === 0) {
        // If firestore is completely unseeded, standard fallback maps
        const localMappedTracks = SAMPLE_TRACKS.map(t => ({
          ...t,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
        } as Track));
        setTracks(localMappedTracks);
      } else {
        setTracks(fetchedTracks);
      }
      setLoadingTracks(false);
    }, (error) => {
      console.warn("Could not fetch real-time Firestore tracks. Falling back to static assets.", error);
      // Fallback in case of lack of permissions or database uninitialized
      const localMappedTracks = SAMPLE_TRACKS.map(t => ({
        ...t,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      } as Track));
      setTracks(localMappedTracks);
      setLoadingTracks(false);
    });

    return () => unsubTracks();
  }, []);

  // Sync Logged-In User Liked Track IDs
  useEffect(() => {
    if (!user) {
      setLikedTrackIds([]);
      return;
    }

    const likesQuery = query(collection(db, "likes"), where("userId", "==", user.uid));
    const unsubLikes = onSnapshot(likesQuery, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((doc) => {
        const likeData = doc.data();
        if (likeData.trackId) {
          ids.push(likeData.trackId);
        }
      });
      setLikedTrackIds(ids);
    }, (error) => {
      console.warn("Error reading likes index from database", error);
    });

    return () => unsubLikes();
  }, [user]);

  // Sync Playlists
  useEffect(() => {
    const playlistsCol = collection(db, "playlists");
    // Standard access criteria matching list permission
    const unsubPlaylists = onSnapshot(playlistsCol, (snapshot) => {
      const fetchedPlaylists: Playlist[] = [];
      snapshot.forEach((doc) => {
        fetchedPlaylists.push({ ...doc.data(), id: doc.id } as Playlist);
      });
      setPlaylists(fetchedPlaylists);
    }, (error) => {
      console.warn("Error subscribing to playlists", error);
    });

    return () => unsubPlaylists();
  }, []);

  // Audio Object Event Binding Hook
  useEffect(() => {
    // Create modern HTML5 audio stream elements
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onAudioEnded = () => {
      // Standard playback next loop or trigger repeat rules
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onAudioEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onAudioEnded);
      audio.pause();
    };
  }, [queue, currentIndex]);

  // Handle Play/Pause side-effects
  useEffect(() => {
    if (!audioRef.current || !activeTrack) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.warn("Audio play interrupted or requires gesture interaction", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeTrack]);

  // Admin Verification
  const isAdmin = userProfile?.isAdmin || (user?.email === "borborschool.admin@gmail.com");

  // Auth Operations
  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login Error: ", err);
      const code = err?.code || "auth/unknown";
      const message = err?.message || String(err);
      const host = window.location.hostname;
      setAuthError({ code, message, host });
    }
  };

  const logoutUser = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      await signOut(auth);
    } catch (err) {
      console.error("Sign-out Error: ", err);
    }
  };

  // Music Player Handlers
  const playTrack = (track: Track, customQueue?: Track[]) => {
    const finalQueue = customQueue && customQueue.length > 0 ? customQueue : tracks;
    const index = finalQueue.findIndex(t => t.id === track.id);
    
    setQueue(finalQueue);
    setCurrentIndex(index >= 0 ? index : 0);
    setActiveTrack(track);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
    }
    
    setIsPlaying(true);

    // Record dynamic play metrics in background asynchronously after minimal delay
    setTimeout(async () => {
      try {
        const trackRef = doc(db, "tracks", track.id);
        const docSnap = await getDoc(trackRef);
        if (docSnap.exists()) {
          await updateDoc(trackRef, {
            plays: increment(1)
          });
        }
      } catch (err) {
        // Supress error for local/fallback tracks
        console.debug("Silent increment stats skip for mock track or permissions", err);
      }
    }, 4500);
  };

  const togglePlay = () => {
    if (!activeTrack && tracks.length > 0) {
      playTrack(tracks[0]);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    playTrack(queue[nextIndex], queue);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    const prevIndex = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    playTrack(queue[prevIndex], queue);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  // Toggle Like Tracker with Relational Updates & Increments
  const toggleLikeTrack = async (trackId: string) => {
    if (!user) {
      alert("Please sign in to like your favorite music tracks.");
      return;
    }

    const likeDocId = `${user.uid}_${trackId}`;
    const likeDocRef = doc(db, "likes", likeDocId);
    const trackRef = doc(db, "tracks", trackId);

    const isCurrentlyLiked = likedTrackIds.includes(trackId);

    try {
      if (isCurrentlyLiked) {
        // Dislike action: Delete doc + decrement index
        await deleteDoc(likeDocRef);
        try {
          await updateDoc(trackRef, {
            likesCount: increment(-1)
          });
        } catch (_) {} // Skip if mock track
      } else {
        // Like action: Create doc + increment counter
        const likeObject = {
          id: likeDocId,
          userId: user.uid,
          trackId: trackId,
          createdAt: serverTimestamp()
        };
        await setDoc(likeDocRef, likeObject);
        try {
          await updateDoc(trackRef, {
            likesCount: increment(1)
          });
        } catch (_) {} // Skip if mock track
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `likes/${likeDocId}`);
    }
  };

  const isLiked = (trackId: string) => {
    return likedTrackIds.includes(trackId);
  };

  const recordShare = async (trackId: string) => {
    try {
      const trackRef = doc(db, "tracks", trackId);
      await updateDoc(trackRef, {
        sharesCount: increment(1)
      });
    } catch (e) {
      console.debug("Mock track or shared update skipped", e);
    }
  };

  // Seeding the Database (Triggered by Admin inside the app if needed)
  const seedTracks = async () => {
    if (!isAdmin) {
      alert("Only authenticated Administrators can bootstrap the database.");
      return;
    }

    try {
      const batch = writeBatch(db);
      for (const t of SAMPLE_TRACKS) {
        const docRef = doc(db, "tracks", t.id);
        batch.set(docRef, {
          ...t,
          uploadedBy: user?.uid || "system-admin",
          createdAt: serverTimestamp()
        });
      }
      await batch.commit();
      alert("Successfully seeded MusisBox with " + SAMPLE_TRACKS.length + " high-fidelity tracks!");
    } catch (error) {
      alert("Bootstrapping failed. Ensure security rules are uploaded correctly.");
      handleFirestoreError(error, OperationType.WRITE, "tracks/seeding-batch");
    }
  };

  // Track comments real-time listener hook
  const getTrackComments = (trackId: string, callback: (comments: Comment[]) => void) => {
    const commentsCol = collection(db, "tracks", trackId, "comments");
    const q = query(commentsCol, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const list: Comment[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as Comment);
      });
      callback(list);
    }, (err) => {
      console.warn("Could not stream subcollection track comments", err);
      callback([]);
    });
  };

  // Write new comment
  const addComment = async (trackId: string, content: string) => {
    if (!user) {
      alert("Please sign in to write comments.");
      return;
    }
    if (!content.trim()) return;

    const commentId = Math.random().toString(36).substring(2, 11);
    const commentRef = doc(db, "tracks", trackId, "comments", commentId);

    const commentPayload: Comment = {
      id: commentId,
      trackId,
      userId: user.uid,
      userDisplayName: user.displayName || "Fan",
      userPhotoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
      content: content.trim(),
      createdAt: new Date() // Will be localized as standard ISO
    };

    try {
      await setDoc(commentRef, {
        ...commentPayload,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tracks/${trackId}/comments/${commentId}`);
    }
  };

  const deleteComment = async (trackId: string, commentId: string) => {
    const commentRef = doc(db, "tracks", trackId, "comments", commentId);
    try {
      await deleteDoc(commentRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tracks/${trackId}/comments/${commentId}`);
    }
  };

  // Playlist management
  const createPlaylist = async (title: string, description: string, isPublic: boolean, coverUrl = "") => {
    if (!user) return;
    const plId = "playlist_" + Date.now();
    const plRef = doc(db, "playlists", plId);
    const plObj: Playlist = {
      id: plId,
      title,
      description,
      coverUrl: coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
      creatorId: user.uid,
      creatorName: user.displayName || "Curator",
      trackIds: [],
      isPublic,
      createdAt: new Date()
    };
    try {
      await setDoc(plRef, {
        ...plObj,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `playlists/${plId}`);
    }
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    const playListRef = doc(db, "playlists", playlistId);
    try {
      const plSnap = await getDoc(playListRef);
      if (plSnap.exists()) {
        const data = plSnap.data();
        const currentIds: string[] = data.trackIds || [];
        if (!currentIds.includes(trackId)) {
          await updateDoc(playListRef, {
            trackIds: [...currentIds, trackId]
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `playlists/${playlistId}`);
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const playListRef = doc(db, "playlists", playlistId);
    try {
      const plSnap = await getDoc(playListRef);
      if (plSnap.exists()) {
        const data = plSnap.data();
        const currentIds: string[] = data.trackIds || [];
        await updateDoc(playListRef, {
          trackIds: currentIds.filter(id => id !== trackId)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `playlists/${playlistId}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loadingAuth,
        tracks,
        loadingTracks,
        activeTrack,
        isPlaying,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        queue,
        currentIndex,
        currentTime,
        duration,
        volume,
        seek,
        changeVolume,
        loginWithGoogle,
        logoutUser,
        seedTracks,
        toggleLikeTrack,
        isLiked,
        recordShare,
        addComment,
        deleteComment,
        getTrackComments,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        playlists,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
