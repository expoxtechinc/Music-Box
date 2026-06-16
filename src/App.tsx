import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/Sidebar";
import { MusicPlayer } from "./components/MusicPlayer";
import { TrackCard } from "./components/TrackCard";
import { AdminPanel } from "./components/AdminPanel";
import { PlaylistModal } from "./components/PlaylistModal";
import { AuthTroubleshootingModal } from "./components/AuthTroubleshootingModal";
import { Search, Compass, Music, UserCheck, Play, Sparkles, FolderHeart, ListMusic, Volume2, ShieldCheck, HelpCircle, Plus } from "lucide-react";
import { GENRES } from "./data/mockSongs";
import { Track, Playlist } from "./types";

function DashboardContent() {
  const { 
    user, 
    tracks, 
    loadingTracks, 
    isLiked, 
    playlists, 
    playTrack,
    isAdmin,
    seedTracks
  } = useApp();

  const [currentTab, setCurrentTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Parse direct track anchor links if present in URL (e.g., ?track=track_abc)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParamId = params.get("track");
    if (trackParamId && tracks.length > 0) {
      const match = tracks.find(t => t.id === trackParamId);
      if (match) {
        // Play track automatically if found
        playTrack(match, tracks);
      }
    }
  }, [tracks]);

  // Handle category views changes
  const handleTabChange = (tabId: string) => {
    setSelectedPlaylist(null);
    setCurrentTab(tabId);
  };

  // Filter and search calculations
  const filteredTracks = tracks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.genre && t.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === "All" || t.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  // Trending tracks: Sort tracks by play count descending
  const trendingTracks = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0));

  // Liked songs: Filter by isLiked helper mapping
  const likedTracks = tracks.filter(t => isLiked(t.id));

  // Featured track logic: most active popularity song
  const featuredTrack = tracks.reduce((popular, current) => {
    return (current.plays || 0) > (popular?.plays || 0) ? current : popular;
  }, tracks[0] || null);

  const handleSelectPlaylist = (pl: Playlist) => {
    setSelectedPlaylist(pl);
    setCurrentTab("playlists_detail");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#0C0C0C] text-white overflow-hidden pb-22" id="app-root-frame">
      
      {/* Sidebar Nav */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={handleTabChange} 
        onCreatePlaylist={() => setShowPlaylistModal(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0C0C0C] overflow-y-auto px-4 sm:px-8 py-6 pb-12 custom-scrollbar relative">
        
        {/* Real-time search element header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
            <input 
              id="global-search-bar"
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search artists, tracks, podcasts..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans placeholder-white/30"
            />
          </div>

          <div className="flex items-center gap-2 select-none self-end sm:self-auto text-white/40 text-xs font-mono">
            {tracks.length > 0 && (
              <span className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                Catalog: {tracks.length} songs
              </span>
            )}
            {user && (
              <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Cloud Sync Active
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Pages Dispatcher */}
        {currentTab === "discover" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. HERO CAROUSEL BANNER */}
            {featuredTrack && !searchQuery && selectedGenre === "All" && (
              <div 
                id="hero-featured-banner"
                onClick={() => playTrack(featuredTrack, tracks)}
                className="relative h-56 bg-[#0C0C0C] rounded-3xl overflow-hidden cursor-pointer group border border-white/10 shadow-xl"
              >
                {/* Background Dim Backdrop */}
                {featuredTrack.coverUrl ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60"
                    style={{ backgroundImage: `url(${featuredTrack.coverUrl})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-[#0C0C0C]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent z-10"></div>

                {/* Banner Content elements */}
                <div className="relative z-20 h-full p-6 sm:p-8 flex flex-col justify-center max-w-lg">
                  <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase w-fit mb-2 text-orange-500">
                    Featured Release
                  </span>

                  <div>
                    <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter leading-none mb-1 text-white group-hover:text-orange-500 transition-colors uppercase">
                      {featuredTrack.title}
                    </h2>
                    <p className="text-white/80 font-medium">
                      Listen to the popular track by {featuredTrack.artist}.
                    </p>
                    <p className="text-xs text-white/50 font-sans leading-relaxed line-clamp-1 mt-1.5 px-0.5">
                      {featuredTrack.description || "Immerse yourself into the premium, lossless quality of this popular audio piece currently sweeping SoundBox discovery registers."}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(featuredTrack, tracks);
                      }}
                      className="bg-orange-500 hover:bg-orange-400 text-black px-6 py-2 rounded-full text-xs font-black shadow-lg shadow-orange-500/10 flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
                      <span>Play Now</span>
                    </button>
                    <span className="text-[10px] text-white/40 font-mono font-bold">
                      {featuredTrack.plays >= 1000 ? `${(featuredTrack.plays/1000).toFixed(1)}k streams` : `${featuredTrack.plays} plays`}
                    </span>
                  </div>
                </div>

                {/* Cover graphic (Right Side absolute float) */}
                {featuredTrack.coverUrl && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 w-36 h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 hidden md:block select-none pointer-events-none z-20">
                    <img 
                      src={featuredTrack.coverUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-505" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2. GENRE BUBBLE TAGS SELECTOR */}
            <div className="shrink-0">
              <p className="text-xs uppercase font-extrabold tracking-wider text-orange-500 mb-3.5 font-mono italic">Select Genre</p>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scroll-hide select-none">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected 
                          ? "bg-orange-500 border-orange-500 text-black shadow-md shadow-orange-500/5 italic" 
                          : "bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. CORE MUSIC GRID DISCOVER */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black italic tracking-tighter text-white hover:text-orange-500 transition-colors uppercase">
                  {selectedGenre === "All" ? "Discover Rooms" : `${selectedGenre} Collections`}
                </h3>
                <span className="text-xs text-white/40 font-semibold font-mono">
                  Showing {filteredTracks.length} items
                </span>
              </div>

              {loadingTracks ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={`shimmer-${i}`} className="bg-white/5 rounded-2xl p-3 border border-white/5 animate-pulse h-60"></div>
                  ))}
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 max-w-lg mx-auto">
                  <Compass className="w-10 h-10 text-white/30 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-white">No tracks discovered</h4>
                  <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto leading-relaxed">
                    We couldn't locate any matching songs for your search filters.
                  </p>
                  {isAdmin && tracks.length === 0 && (
                    <button 
                      onClick={seedTracks}
                      className="mt-4 text-xs font-black bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 px-4 py-2 rounded-xl border border-orange-500/20 transition-all cursor-pointer"
                    >
                      Load Demo System Tracks
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" id="discover-tracks-grid">
                  {filteredTracks.map((track) => (
                    <TrackCard 
                      key={track.id} 
                      track={track} 
                      layout="grid"
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {currentTab === "trending" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Trending Now Standings</h3>
              <p className="text-xs text-white/40 mt-1">Tracks sorted live according to highest accumulated network play counts.</p>
            </div>

            {loadingTracks ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={`shim-t-${i}`} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : trendingTracks.length === 0 ? (
              <p className="text-sm text-white/30">Popularity indexes are empty.</p>
            ) : (
              <div className="space-y-2.5 max-w-4xl" id="trending-tracks-list">
                {trendingTracks.map((track, i) => (
                  <TrackCard 
                    key={track.id} 
                    track={track} 
                    rank={i + 1} 
                    layout="list"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "liked" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Your Saved Favorites</h3>
              <p className="text-xs text-white/40 mt-1">Curated songs bookmarked on your listener profile.</p>
            </div>

            {!user ? (
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-center max-w-md mx-auto">
                <FolderHeart className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">Cloud Authentication Required</h4>
                <p className="text-xs text-white/40 leading-relaxed mt-1 mb-4">Connect with google to authorize cloud bookmarks storage.</p>
              </div>
            ) : likedTracks.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 max-w-md mx-auto">
                <FolderHeart className="w-10 h-10 text-white/30 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">Your favorites drawer is clean</h4>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">Start exploring the catalogs and click the heart icon on any music to find it here!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-w-4xl" id="liked-tracks-list">
                {likedTracks.map((track) => (
                  <TrackCard 
                    key={track.id} 
                    track={track} 
                    layout="list"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "playlists" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Interactive Playlists</h3>
                <p className="text-xs text-white/40 mt-1">Ordered sets of audio streams grouped by the community curators.</p>
              </div>
              
              {user && (
                <button 
                  onClick={() => setShowPlaylistModal(true)}
                  className="bg-orange-500 hover:bg-orange-400 text-black px-5 py-2.5 rounded-full text-xs font-black shadow-lg shadow-orange-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Build Playlist</span>
                </button>
              )}
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 max-w-md mx-auto">
                <ListMusic className="w-10 h-10 text-white/30 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">No playlists found</h4>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">Build custom compilation sets to organize genres or mood flows.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="playlists-grid">
                {playlists.map((pl) => (
                  <div 
                    key={pl.id} 
                    onClick={() => handleSelectPlaylist(pl)}
                    className="group bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden"
                  >
                    <div className="w-14 h-14 bg-[#0C0C0C] rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={pl.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80" }
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-orange-500 truncate">{pl.title}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">by {pl.creatorName}</p>
                      <p className="text-[10px] text-orange-500 font-mono mt-1 font-bold">{pl.trackIds.length} Songs</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "playlists_detail" && selectedPlaylist && (
          <div className="space-y-6 animate-fade-in">
            {/* Back to lists trigger */}
            <button 
              onClick={() => setCurrentTab("playlists")}
              className="text-xs text-white/45 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-bold uppercase tracking-wider"
            >
              ← All Playlists
            </button>

            {/* Profile Info block */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="w-24 h-24 bg-[#0C0C0C] rounded-2xl overflow-hidden shadow-lg shrink-0">
                <img 
                  src={selectedPlaylist.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80"} 
                  alt="" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Compilations</span>
                <h2 className="text-2xl font-black text-white mt-2 leading-none italic">{selectedPlaylist.title}</h2>
                <p className="text-xs text-white/50 mt-1.5">{selectedPlaylist.description || "SoundBox curated compilations folder."}</p>
                <p className="text-xs text-white/40 font-medium mt-3">Curated by <span className="text-orange-500 font-bold">{selectedPlaylist.creatorName}</span> • Contains <span className="text-orange-500 font-mono font-bold">{selectedPlaylist.trackIds.length} song recordings</span></p>
              </div>
            </div>

            {/* Tracks listing */}
            <div>
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest font-mono mb-3">Song list</h3>
              {selectedPlaylist.trackIds.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-xs text-white/40">This playlist currently contains no songs. Find any song in the Discover feed and click the '+' sign to populate it!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tracks
                    .filter(t => selectedPlaylist.trackIds.includes(t.id))
                    .map((track, i) => (
                      <TrackCard 
                        key={track.id} 
                        track={track} 
                        rank={i + 1}
                        layout="list"
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === "admin" && (
          <div className="animate-fade-in shrink-0">
            <AdminPanel />
          </div>
        )}

      </main>

      {/* Persistent global floating audio player footer */}
      <MusicPlayer />

      {/* Create playlist Modal frame */}
      {showPlaylistModal && (
        <PlaylistModal onClose={() => setShowPlaylistModal(false)} />
      )}

      {/* Auth Troubleshooting Modal */}
      <AuthTroubleshootingModal />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
