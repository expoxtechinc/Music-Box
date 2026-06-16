import React, { useState } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Maximize2, ChevronDown, ListMusic, MessageSquare, BookOpen, Heart, Share2, Music 
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CommentSection } from "./CommentSection";

export const MusicPlayer: React.FC = () => {
  const { 
    activeTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    currentTime, 
    duration, 
    seek, 
    volume, 
    changeVolume,
    queue,
    isLiked,
    toggleLikeTrack,
    recordShare
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"lyrics" | "comments" | "queue">("comments");
  const [isCopied, setIsCopied] = useState(false);

  if (!activeTrack) return null;

  const liked = isLiked(activeTrack.id);

  // Time Formatter
  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleShare = async () => {
    await recordShare(activeTrack.id);
    const shareUrl = `${window.location.origin}?track=${activeTrack.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_) {
      alert(`Copied link: ${shareUrl}`);
    }
  };

  return (
    <>
      {/* 1. FLOATING MINI AUDIO PLAYER (BOTTOM BAR) */}
      <div className="fixed bottom-0 left-0 right-0 h-22 bg-[#0C0C0C]/95 border-t border-white/10 backdrop-blur-md z-45 flex flex-col justify-between px-4 sm:px-6 py-2">
        
        {/* Top Progress Bar Scrubber */}
        <div className="w-full h-1 relative flex items-center group -mt-2">
          <input 
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full accent-orange-500 h-1 bg-white/10 cursor-pointer rounded-lg hover:h-1.5 transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-4 h-full">
          
          {/* Track details (Left segment) */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-[280px]">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#0C0C0C] cursor-pointer shrink-0" onClick={() => setIsExpanded(true)}>
              {activeTrack.coverUrl ? (
                <img 
                  src={activeTrack.coverUrl} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0C0C0C] text-orange-500">
                  <Music className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="min-w-0">
              <h4 className="text-sm font-black text-white truncate hover:text-orange-500 cursor-pointer" onClick={() => setIsExpanded(true)}>
                {activeTrack.title}
              </h4>
              <p className="text-xs text-white/50 truncate mt-0.5">{activeTrack.artist}</p>
            </div>
          </div>

          {/* Action core controls (Middle core segment) */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-3 sm:gap-6">
              <button onClick={prevTrack} className="text-white/60 hover:text-white p-2 transition-colors">
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              
              <button 
                id="footer-play-pause-btn"
                onClick={togglePlay} 
                className="p-3 bg-orange-500 hover:bg-orange-400 text-black rounded-full shadow-lg transform active:scale-95 transition-all outline-none"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              
              <button onClick={nextTrack} className="text-white/60 hover:text-white p-2 transition-colors">
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
            
            {/* Direct time counts */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/40 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Audio volume and utility triggers (Right segment) */}
          <div className="flex items-center gap-3 sm:gap-5 justify-end flex-1 sm:max-w-[280px]">
            {/* Quick counters */}
            <div className="hidden md:flex items-center gap-1 text-white/60">
              <button 
                id="footer-like-btn"
                onClick={() => toggleLikeTrack(activeTrack.id)} 
                className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${liked ? "text-red-500" : ""}`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              </button>
              <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors relative">
                <Share2 className="w-4 h-4" />
                {isCopied && (
                  <span className="absolute bottom-full mb-1 right-0 bg-[#0C0C0C] border border-white/10 text-[9px] text-white px-1 py-0.5 rounded shadow whitespace-nowrap">Copied!</span>
                )}
              </button>
            </div>

            {/* Volume sliders */}
            <div className="hidden sm:flex items-center gap-2 text-white/60 group">
              <button onClick={() => changeVolume(volume === 0 ? 0.8 : 0)} className="hover:text-white transition-colors">
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => changeVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-20 accent-orange-500 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <button 
              id="maximize-player-btn"
              onClick={() => setIsExpanded(true)} 
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
              title="Expand Player View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. FULL IMMERSIVE EXPANDED OVERLAY PANEL (THE DRAWER) */}
      {isExpanded && (
        <div id="expanded-player-modal" className="fixed inset-0 bg-[#0C0C0C] z-50 overflow-y-auto font-sans flex flex-col justify-between">
          
          {/* Top Header bar */}
          <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
            <button 
              id="collapse-player-btn"
              onClick={() => setIsExpanded(false)} 
              className="p-2 sm:p-3 bg-white/5 text-white/80 hover:text-white rounded-2xl hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronDown className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Back</span>
            </button>
            
            <div className="text-center">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest font-mono italic">Now Playing On Soundbox</p>
              <p className="text-xs text-white/40 truncate max-w-[200px] mt-0.5">{activeTrack.genre || "Music Discovery"}</p>
            </div>

            <button onClick={handleShare} className="p-2.5 bg-white/5 text-white/80 hover:text-white rounded-2xl hover:bg-white/10 transition-all relative cursor-pointer">
              <Share2 className="w-4 h-4" />
              {isCopied && (
                <span className="absolute top-full mt-2 right-0 bg-black border border-white/10 text-[10.5px] text-white px-2 py-0.5 rounded shadow z-50">Link Copied!</span>
              )}
            </button>
          </div>

          <div className="w-full max-w-7xl mx-auto px-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center overflow-y-auto">
            
            {/* Centered Album Cover Art & Control Block (Left Segment) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center space-y-6">
              <div className="w-full max-w-[340px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0C0C0C] relative">
                {activeTrack.coverUrl ? (
                  <img 
                    src={activeTrack.coverUrl} 
                    alt="" 
                    className="w-full h-full object-cover shadow-2xl animate-spin-slow-duration" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0C0C0C] text-orange-500">
                    <Music className="w-20 h-20" />
                  </div>
                )}
              </div>

              <div className="text-center w-full max-w-[340px]">
                <h2 className="text-2xl font-black text-white truncate px-1 tracking-tighter italic uppercase">{activeTrack.title}</h2>
                <h3 className="text-sm text-white/55 truncate mt-1.5 font-semibold">by {activeTrack.artist}</h3>
              </div>

              {/* Like / Actions Bar */}
              <div className="flex justify-center items-center gap-4 w-full">
                <button 
                  onClick={() => toggleLikeTrack(activeTrack.id)}
                  className={`p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2 text-sm font-bold cursor-pointer ${
                    liked ? "text-red-500 border-red-500/20 bg-red-500/5 animate-pulse" : "text-white/80"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  <span>{liked ? "Loved" : "Love Track"}</span>
                </button>
                <a
                  href={activeTrack.audioUrl}
                  download={`${activeTrack.artist} - ${activeTrack.title}.mp3`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-white/80 text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <SkipBack className="w-4 h-4 rotate-270 text-orange-500" />
                  Download Song
                </a>
              </div>
            </div>

            {/* Interactive Tabbed Panel Stream (Right Segment) */}
            <div className="md:col-span-12 lg:col-span-7 h-[420px] md:h-[500px] flex flex-col overflow-hidden">
              <div className="flex gap-2 bg-black p-1 rounded-xl border border-white/10 mb-4 shrink-0">
                <button
                  onClick={() => setActiveTab("comments")}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "comments" ? "bg-orange-500 text-black font-black italic shadow-md shadow-orange-500/10" : "text-white/60 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion (Community)</span>
                </button>
                <button
                  onClick={() => setActiveTab("lyrics")}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "lyrics" ? "bg-orange-500 text-black font-black italic shadow-md shadow-orange-500/10" : "text-white/60 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lyrics & Story</span>
                </button>
                <button
                  onClick={() => setActiveTab("queue")}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "queue" ? "bg-orange-500 text-black font-black italic shadow-md shadow-orange-500/10" : "text-white/60 hover:text-white"
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>Next Up Queue</span>
                </button>
              </div>

              {/* Dynamic Content Panel rendering based on active tab */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "comments" && (
                  <CommentSection trackId={activeTrack.id} />
                )}

                {activeTab === "lyrics" && (
                  <div className="bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 h-full overflow-y-auto space-y-6 custom-scrollbar">
                    {activeTrack.description && (
                      <div>
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-orange-500 mb-2 font-mono italic">Behind The Song</h4>
                        <p className="text-xs text-white/70 leading-relaxed font-sans font-medium">{activeTrack.description}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-orange-500 mb-2 font-mono italic">Lyrics</h4>
                      {activeTrack.lyrics ? (
                        <p className="text-xs text-white/60 leading-6 font-mono whitespace-pre-wrap break-words bg-black/40 border border-white/5 p-4 rounded-xl">
                          {activeTrack.lyrics}
                        </p>
                      ) : (
                        <p className="text-xs text-white/30 italic">No lyrics provided for this audio track.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "queue" && (
                  <div className="bg-[#0C0C0C] border border-white/10 rounded-2xl p-4 h-full overflow-y-auto space-y-2 custom-scrollbar">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-orange-500 font-mono mb-3 px-1 italic">Upcoming Queue ({queue.length})</h4>
                    {queue.length === 0 ? (
                      <p className="text-xs text-white/30 px-1">Queue is empty.</p>
                    ) : (
                      queue.map((track, i) => {
                        const isCurrentInQueue = track.id === activeTrack.id;
                        return (
                          <div 
                            key={`queue-item-${track.id}-${i}`}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all cursor-pointer ${
                              isCurrentInQueue 
                                ? "bg-orange-500/10 border border-orange-500/15" 
                                : "hover:bg-black/40"
                            }`}
                          >
                            <img 
                              src={track.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=50" }
                              alt="" 
                              className="w-10 h-10 object-cover rounded-lg bg-black"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-black truncate ${isCurrentInQueue ? "text-orange-500 italic" : "text-white"}`}>{track.title}</p>
                              <p className="text-[10px] text-white/40 truncate mt-0.5">{track.artist}</p>
                            </div>
                            
                            {isCurrentInQueue && (
                              <div className="flex gap-0.5 items-end h-3 px-1.5 animate-pulse">
                                <span className="w-0.5 h-full bg-orange-500 rounded"></span>
                                <span className="w-0.5 h-[60%] bg-orange-500 rounded"></span>
                                <span className="w-0.5 h-[80%] bg-orange-500 rounded"></span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Persistent Core Audio Controls (Footer inside expansion drawer) */}
          <div className="w-full bg-[#0C0C0C] border-t border-white/10 py-6 shrink-0 z-48">
            <div className="w-full max-w-lg mx-auto px-6 flex flex-col items-center gap-4">
              
              {/* Timeline Slider bar with counts */}
              <div className="w-full flex items-center justify-between gap-4">
                <span className="text-[11px] text-white/40 font-mono font-bold shrink-0">{formatTime(currentTime)}</span>
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="flex-1 accent-orange-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-white/40 font-mono font-bold shrink-0">{formatTime(duration)}</span>
              </div>

              {/* Trigger handlers */}
              <div className="flex items-center gap-8 mt-2">
                <button onClick={prevTrack} className="p-2 text-white/60 hover:text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer">
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                <button 
                  onClick={togglePlay} 
                  className="p-5 bg-orange-500 hover:bg-orange-400 hover:scale-105 active:scale-95 text-black rounded-full shadow-2xl transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
                </button>

                <button onClick={nextTrack} className="p-2 text-white/60 hover:text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer">
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>
              </div>

            </div>
          </div>

        </div>
      )}
    </>
  );
};
