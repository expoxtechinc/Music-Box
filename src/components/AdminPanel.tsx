import React, { useState, useRef } from "react";
import { Upload, FileAudio, Image, Sparkles, Database, Trash2, ListMusic, Plus, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { collection, addDoc, doc, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export const AdminPanel: React.FC = () => {
  const { user, seedTracks, tracks, isAdmin } = useApp();

  // Mode state: 'upload_file' or 'upload_url'
  const [uploadMode, setUploadMode] = useState<"file" | "url">("url");

  // Track state
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Pop");
  const [duration, setDuration] = useState("180"); // in seconds
  const [description, setDescription] = useState("");
  const [lyrics, setLyrics] = useState("");

  const [audioUrl, setAudioUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Loading/Progress states
  const [uploading, setUploading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Statistics calculations
  const totalPlays = tracks.reduce((acc, t) => acc + (t.plays || 0), 0);
  const totalLikes = tracks.reduce((acc, t) => acc + (t.likesCount || 0), 0);

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setGenre("Pop");
    setDuration("180");
    setDescription("");
    setLyrics("");
    setAudioUrl("");
    setCoverUrl("");
    setAudioFile(null);
    setCoverFile(null);
    setAudioProgress(0);
    setCoverProgress(0);
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "audio" | "cover") => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (type === "audio") {
        setAudioFile(selected);
      } else {
        setCoverFile(selected);
      }
    }
  };

  // Upload raw file helper
  const uploadFilePromise = (file: File, folderName: string, onProgress: (pct: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${folderName}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      alert("Track title and artist/creator name are mandatory.");
      return;
    }

    setUploading(true);
    setStatusMsg("Starting compile...");

    try {
      let finalAudioUrl = audioUrl;
      let finalCoverUrl = coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80";

      if (uploadMode === "file") {
        if (!audioFile) {
          alert("Please select an audio file (MP3/WAV) to complete uploading.");
          setUploading(false);
          return;
        }

        setStatusMsg("Uploading Audio File...");
        finalAudioUrl = await uploadFilePromise(audioFile, "audio", setAudioProgress);

        if (coverFile) {
          setStatusMsg("Uploading Cover Image...");
          finalCoverUrl = await uploadFilePromise(coverFile, "covers", setCoverProgress);
        }
      } else {
        if (!audioUrl.trim()) {
          alert("Please enter a valid HTTP streaming audio URL.");
          setUploading(false);
          return;
        }
      }

      setStatusMsg("Publishing track to Firestore...");

      const trackId = "track_" + Date.now().toString();
      const trackRef = doc(db, "tracks", trackId);

      const trackObj = {
        id: trackId,
        title: title.trim(),
        artist: artist.trim(),
        audioUrl: finalAudioUrl,
        coverUrl: finalCoverUrl,
        duration: parseInt(duration) || 180,
        genre,
        description: description.trim(),
        lyrics: lyrics.trim(),
        plays: 0,
        likesCount: 0,
        sharesCount: 0,
        uploadedBy: user?.uid || "admin",
        createdAt: serverTimestamp()
      };

      await setDoc(trackRef, trackObj);
      setStatusMsg("Successfully published track!");
      setTimeout(() => setStatusMsg(""), 2000);
      resetForm();
      alert("New Track Published Successfully!");
    } catch (err: any) {
      console.error(err);
      setStatusMsg("Upload failed: " + (err?.message || err));
      alert("Failed to publish song. If your Firebase Storage/Firestore is not configured, please ensure they are enabled or try using 'HTTP URLs Mode' instead!");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (trackId: string) => {
    if (confirm("Are you sure you want to delete this track from Soundbox permanently?")) {
      try {
        await deleteDoc(doc(db, "tracks", trackId));
        alert("Track deleted successfully.");
      } catch (err) {
        alert("Delete failed due to security policies.");
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#0C0C0C]/40 rounded-3xl p-8 border border-white/10 text-center max-w-lg mx-auto font-sans">
        <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">Administrative Console</h3>
        <p className="text-sm text-white/50 mb-6 leading-relaxed font-semibold">
          The administrative control room is designed exclusively for creator accounts. Regular listeners can review metadata, play tracks, download music, leave comments, and like/share songs.
        </p>
        <p className="text-xs text-orange-500 bg-orange-500/10 inline-block px-4 py-2 rounded-xl font-black border border-orange-500/20 font-mono italic">
          Logged In ID: {user?.email || "Guest User"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Admin stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0C0C0C] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs text-white/40 font-black uppercase tracking-wider italic">Catalog Tracks</span>
          <span className="text-3xl font-black text-orange-500 mt-2 font-mono">{tracks.length}</span>
        </div>
        <div className="bg-[#0C0C0C] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs text-white/40 font-black uppercase tracking-wider italic">Total Playbacks</span>
          <span className="text-3xl font-black text-white mt-2 font-mono">{totalPlays}</span>
        </div>
        <div className="bg-[#0C0C0C] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs text-white/40 font-black uppercase tracking-wider italic">Active Likes</span>
          <span className="text-3xl font-black text-red-500 mt-2 font-mono">{totalLikes}</span>
        </div>
      </div>

      {/* Main Admin layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload Form (Main block) */}
        <div className="lg:col-span-7 bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 sm:p-8 shrink-0">
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Upload New Track</h3>
            </div>
            
            {/* Seed Action */}
            <button 
              onClick={seedTracks}
              className="flex items-center gap-2 text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3.5 py-1.5 rounded-xl border border-orange-500/20 transition-all font-black uppercase italic cursor-pointer shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              Seed Demo Tracks
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title / Artist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Track Title *</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Moonlight Dreams" 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Artist / Creator Name *</label>
                <input 
                  type="text" 
                  required
                  value={artist} 
                  onChange={e => setArtist(e.target.value)}
                  placeholder="e.g. Luna Eclipse" 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Genre / Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Music Genre</label>
                <select 
                  value={genre} 
                  onChange={e => setGenre(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Electronic">Electronic</option>
                  <option value="Lofi Hip-Hop">Lofi Hip-Hop</option>
                  <option value="Indie Rock">Indie Rock</option>
                  <option value="Vaporwave">Vaporwave</option>
                  <option value="Deep House">Deep House</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Afrobeats">Afrobeats</option>
                  <option value="R&B">R&B</option>
                  <option value="Reggae">Reggae</option>
                  <option value="Pop">Pop</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Track Duration (Seconds)</label>
                <input 
                  type="number" 
                  required
                  value={duration} 
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Upload Selector */}
            <div>
              <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Audio Input Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    uploadMode === "url" 
                      ? "bg-orange-500 text-black shadow-md shadow-orange-500/10" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  HTTP URL Paste
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    uploadMode === "file" 
                      ? "bg-orange-500 text-black shadow-md shadow-orange-500/10" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Direct Storage Upload
                </button>
              </div>
            </div>

            {uploadMode === "url" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Audio Stream Link (MP3/WAV) *</label>
                  <input 
                    type="url" 
                    value={audioUrl} 
                    onChange={e => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/stream.mp3" 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Artwork Cover Link (JPEG/PNG)</label>
                  <input 
                    type="url" 
                    value={coverUrl} 
                    onChange={e => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..." 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Audio File Selection */}
                <div 
                  onClick={() => audioInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-black/40 flex flex-col items-center justify-center min-h-[140px]"
                >
                  <input 
                    type="file" 
                    ref={audioInputRef} 
                    accept="audio/*" 
                    onChange={e => handleFileChange(e, "audio")} 
                    className="hidden" 
                  />
                  <FileAudio className="w-8 h-8 text-white/30 group-hover:text-orange-500 mb-2" />
                  <p className="text-xs font-bold text-white/80">
                    {audioFile ? audioFile.name : "Select Audio Track"}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">supports MP3, WAV, AAC</p>
                  {audioProgress > 0 && (
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-orange-500 h-full" style={{ width: `${audioProgress}%` }}></div>
                    </div>
                  )}
                </div>

                {/* Cover File Selection */}
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-black/40 flex flex-col items-center justify-center min-h-[140px]"
                >
                  <input 
                    type="file" 
                    ref={coverInputRef} 
                    accept="image/*" 
                    onChange={e => handleFileChange(e, "cover")} 
                    className="hidden" 
                  />
                  <Image className="w-8 h-8 text-white/30 group-hover:text-orange-500 mb-2" />
                  <p className="text-xs font-bold text-white/80">
                    {coverFile ? coverFile.name : "Select Cover Art"}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">covers or photography</p>
                  {coverProgress > 0 && (
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-orange-500 h-full" style={{ width: `${coverProgress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Track Commentary / Description</label>
              <textarea 
                rows={2}
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Share background, recording credits, or shoutouts..." 
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 resize-none font-sans"
              />
            </div>

            {/* Lyrics */}
            <div>
              <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Lyrics</label>
              <textarea 
                rows={4}
                value={lyrics} 
                onChange={e => setLyrics(e.target.value)}
                placeholder="[Verse 1] ... [Chorus] ..." 
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-orange-500 hover:bg-orange-400 text-black font-black italic text-sm py-4.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>{statusMsg || "Saving details..."}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    <span>Publish Track</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tracks Director List (Collateral block) */}
        <div className="lg:col-span-5 bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 flex flex-col h-[500px] lg:h-auto overflow-hidden">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-black text-white uppercase italic tracking-tighter">Live Catalog</h3>
            </div>
            <span className="bg-white/5 border border-white/10 text-orange-500 text-xs px-2.5 py-0.5 rounded-full font-mono font-black italic">
              {tracks.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {tracks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/40 rounded-2xl border border-white/15">
                <p className="text-sm text-white/30">No tracks registered. Click Seed Demo Tracks above to instantly start!</p>
              </div>
            ) : (
              tracks.map((track) => (
                <div 
                  key={track.id} 
                  className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/10 hover:bg-black transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img 
                      src={track.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=50" }
                      alt="" 
                      className="w-10 h-10 object-cover rounded-lg bg-black"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-white truncate uppercase italic">{track.title}</p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="p-2 text-white/40 hover:text-red-500 rounded-lg hover:bg-black/80 transition-colors shrink-0 cursor-pointer"
                    title="Delete track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
