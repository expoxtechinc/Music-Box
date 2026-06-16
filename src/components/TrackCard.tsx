import React, { useState } from "react";
import { Play, Pause, Heart, Share2, Download, MessageSquare, Plus, Music } from "lucide-react";
import { Track } from "../types";
import { useApp } from "../context/AppContext";

interface TrackCardProps {
  track: Track;
  rank?: number;
  layout?: "grid" | "list";
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, rank, layout = "grid" }) => {
  const { 
    activeTrack, 
    isPlaying, 
    playTrack, 
    togglePlay, 
    toggleLikeTrack, 
    isLiked, 
    recordShare,
    playlists,
    addTrackToPlaylist
  } = useApp();

  const [showPlaylistsDrop, setShowPlaylistsDrop] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = activeTrack?.id === track.id;
  const isCurrentlyPlaying = isActive && isPlaying;
  const liked = isLiked(track.id);

  const handlePlayClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(track.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Record social sharing increment
    await recordShare(track.id);
    
    // Copy song link to clipboard
    const shareUrl = `${window.location.origin}?track=${track.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      alert(`Track URL copied: ${shareUrl}`);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = Math.floor(secs % 60);
    return `${mins}:${remainSecs < 10 ? "0" : ""}${remainSecs}`;
  };

  if (layout === "list") {
    return (
      <div 
        id={`track-list-item-${track.id}`}
        className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${
          isActive 
            ? "bg-orange-500/10 border border-orange-500/20" 
            : "hover:bg-white/5 border border-transparent"
        }`}
        onClick={handlePlayClick}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {rank !== undefined && (
            <span className={`w-6 text-center font-mono text-sm font-black italic ${
              rank === 1 ? "text-orange-500 text-base" : rank === 2 ? "text-neutral-300" : "text-white/40"
            }`}>
              {rank}
            </span>
          )}

          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#0C0C0C] shrink-0">
            {track.coverUrl ? (
              <img 
                src={track.coverUrl} 
                alt={track.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0C0C0C] text-orange-500">
                <Music className="w-5 h-5" />
              </div>
            )}
            
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}>
              {isCurrentlyPlaying ? (
                <Pause className="w-5 h-5 text-orange-500 fill-orange-500" />
              ) : (
                <Play className="w-5 h-5 text-orange-500 fill-orange-500" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className={`text-sm font-black truncate tracking-tight ${isActive ? "text-orange-500 italic" : "text-white"}`}>
              {track.title}
            </h4>
            <p className="text-xs text-white/55 truncate mt-0.5">{track.artist}</p>
          </div>
        </div>

        {/* Info stats and interactive controls */}
        <div className="flex items-center gap-4 text-white/40 shrink-0 select-none">
          {track.genre && (
            <span className="hidden md:inline-block text-[10px] uppercase font-black bg-white/5 text-orange-500 border border-orange-500/10 px-2.5 py-0.5 rounded font-mono">
              {track.genre}
            </span>
          )}

          <span className="hidden sm:inline-block text-xs font-mono">
            {track.plays >= 1000 ? `${(track.plays/1000).toFixed(1)}k plays` : `${track.plays} plays`}
          </span>

          <span className="text-xs font-mono">{formatDuration(track.duration)}</span>

          {/* Controls */}
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <button 
              id={`like-btn-list-${track.id}`}
              className={`p-2 rounded-lg transition-colors hover:bg-white/5 ${
                liked ? "text-red-500 animate-pulse" : "text-white/40 hover:text-white"
              }`}
              onClick={handleLike}
              title={liked ? "Unlike" : "Like"}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </button>

            <button 
              id={`share-btn-list-${track.id}`}
              className={`p-2 rounded-lg transition-colors hover:bg-white/5 relative ${
                copied ? "text-orange-500" : "text-white/40 hover:text-white"
              }`}
              onClick={handleShare}
              title={copied ? "Copied Link!" : "Copy Share Link"}
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-8 right-0 bg-black border border-white/10 text-[10px] text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>

            <a
              id={`download-link-list-${track.id}`}
              href={track.audioUrl}
              download={`${track.artist} - ${track.title}.mp3`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg transition-colors hover:bg-white/5 text-white/40 hover:text-white"
              title="Download MP3"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Playlist dropdown wrapper */}
            {playlists.length > 0 && (
              <div className="relative">
                <button 
                  id={`playlist-add-list-${track.id}`}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5 text-white/40 hover:text-white"
                  onClick={() => setShowPlaylistsDrop(!showPlaylistsDrop)}
                  title="Add to Playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {showPlaylistsDrop && (
                  <div className="absolute right-0 mt-1 w-48 bg-[#0E0E0E] border border-white/10 rounded-xl shadow-xl z-30 p-1">
                    <p className="text-[10px] text-white/40 px-2 py-1 font-semibold uppercase tracking-wider">Add to Playlist</p>
                    {playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addTrackToPlaylist(pl.id, track.id);
                          setShowPlaylistsDrop(false);
                          alert(`Added to ${pl.title}!`);
                        }}
                        className="w-full text-left font-sans text-xs text-white/70 hover:bg-white/5 hover:text-orange-500 px-2 py-1.5 rounded-lg truncate transition-all"
                      >
                        {pl.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Grid Layout
  return (
    <div 
      id={`track-grid-card-${track.id}`}
      className={`group bg-[#0C0C0C]/40 rounded-2xl p-3 border hover:border-orange-500/40 hover:bg-[#0C0C0C]/90 transition-all duration-300 cursor-pointer flex flex-col relative ${
        isActive ? "border-orange-500/80 bg-orange-500/[0.02]" : "border-white/5"
      }`}
      onClick={handlePlayClick}
    >
      {/* Cover Image Wrapper */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0C0C0C] mb-3.5 shadow-md">
        {track.coverUrl ? (
          <img 
            src={track.coverUrl} 
            alt={track.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0C0C0C] text-orange-500">
            <Music className="w-12 h-12 animate-pulse" />
          </div>
        )}
        
        {/* Play trigger overlay */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          <div className="p-3 bg-orange-500 text-black rounded-full shadow-lg transform active:scale-90 transition-transform duration-100">
            {isCurrentlyPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current" />
            )}
          </div>
        </div>

        {/* Floating Tag */}
        {track.genre && (
          <span className="absolute top-2 left-2 text-[9px] uppercase font-black tracking-widest bg-black/70 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {track.genre}
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between">
        <div>
          <h4 className={`text-base font-black truncate tracking-tighter ${isActive ? "text-orange-500 italic" : "text-white group-hover:text-orange-500"} transition-colors`}>
            {track.title}
          </h4>
          <p className="text-xs text-white/50 truncate mt-0.5 font-medium">{track.artist}</p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-white/30">
              {track.plays >= 1000 ? `${(track.plays/1000).toFixed(1)}k plays` : `${track.plays} plays`}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <button 
              id={`like-btn-grid-${track.id}`}
              className={`p-1.5 rounded-lg transition-colors hover:bg-white/5 ${
                liked ? "text-red-500" : "text-white/30 hover:text-white"
              }`}
              onClick={handleLike}
              title={liked ? "Unlike" : "Like"}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
            </button>

            <button 
              id={`share-btn-grid-${track.id}`}
              className={`p-1.5 rounded-lg transition-colors hover:bg-white/5 relative ${
                copied ? "text-orange-500" : "text-white/30 hover:text-white"
              }`}
              onClick={handleShare}
              title={copied ? "Copied Link!" : "Copy Share Link"}
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied && (
                <span className="absolute -top-8 right-0 bg-black border border-white/10 text-[9px] text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>

            <a
              id={`download-link-grid-${track.id}`}
              href={track.audioUrl}
              download={`${track.artist} - ${track.title}.mp3`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-white/30 hover:text-white"
              title="Download MP3"
            >
              <Download className="w-3.5 h-3.5" />
            </a>

            {playlists.length > 0 && (
              <div className="relative">
                <button 
                  id={`playlist-add-grid-${track.id}`}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-white/30 hover:text-white"
                  onClick={() => setShowPlaylistsDrop(!showPlaylistsDrop)}
                  title="Add to Playlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {showPlaylistsDrop && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-[#0E0E0E] border border-white/10 rounded-xl shadow-xl z-35 p-1">
                    <p className="text-[10px] text-white/40 px-2 py-1 font-semibold uppercase tracking-wider">Add to Playlist</p>
                    {playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addTrackToPlaylist(pl.id, track.id);
                          setShowPlaylistsDrop(false);
                          alert(`Added to ${pl.title}!`);
                        }}
                        className="w-full text-left font-sans text-xs text-white/70 hover:bg-white/5 hover:text-orange-500 px-2 py-1.5 rounded-lg truncate transition-all"
                      >
                        {pl.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
