import React from "react";
import { 
  Compass, TrendingUp, Heart, ListMusic, ShieldCheck, 
  LogIn, LogOut, Disc, Music, Plus 
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onCreatePlaylist }) => {
  const { user, loginWithGoogle, logoutUser, isAdmin } = useApp();

  const menuItems = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "trending", label: "Trending Now", icon: TrendingUp },
    { id: "liked", label: "Liked Songs", icon: Heart },
    { id: "playlists", label: "My Playlists", icon: ListMusic },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0C0C0C] border-r border-white/10 flex flex-col h-full shrink-0 font-sans">
      
      {/* Brand Logo and Title */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="p-2 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-xl text-black shadow-lg shadow-orange-500/20">
          <Disc className="w-6 h-6 animate-spin-slow animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-black text-orange-500 tracking-tighter italic font-mono">SOUNDBOX.</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest -mt-0.5">MusisBox Engine</p>
        </div>
      </div>

      {/* Navigation directory menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="text-[10px] uppercase font-bold text-neutral-550 letter px-3 mb-2 tracking-wider">Features</p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/10 font-black italic"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {isSelected && <span className="w-1 h-3.5 bg-black rounded-full -ml-1"></span>}
              <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Create playlist quick trigger */}
        {user && (
          <button
            onClick={onCreatePlaylist}
            className="w-full flex items-center gap-3.5 px-4 py-3 text-white/50 hover:text-orange-500 transition-colors cursor-pointer text-xs font-bold border border-dashed border-white/10 rounded-xl hover:border-orange-500/40 mt-4"
          >
            <Plus className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span>Create Playlist</span>
          </button>
        )}

        {/* Administration portal */}
        {isAdmin && (
          <div className="pt-6">
            <p className="text-[10px] uppercase font-bold text-white/30 px-3 mb-2 tracking-wider">Creator Zone</p>
            <button
              id="nav-admin"
              onClick={() => setCurrentTab("admin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentTab === "admin"
                  ? "bg-orange-500/15 border border-orange-500/20 text-orange-500 font-bold"
                  : "text-white/40 hover:text-orange-500 hover:bg-white/5 border border-transparent"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 stroke-[2.2]" />
              <span>Admin Console</span>
            </button>
          </div>
        )}
      </nav>

      {/* User Auth Profile Portal Footer */}
      <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-1 rounded-lg">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`} 
                alt="" 
                className="w-10 h-10 rounded-full border border-white/10 bg-[#0C0C0C] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate max-w-[120px]">{user.displayName || "Audiomack Fan"}</p>
                <span className="text-[9px] bg-white/5 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider scale-90 inline-block mt-0.5">
                  {isAdmin ? "Admin Coach" : "Listener"}
                </span>
              </div>
            </div>

            <button 
              id="sidebar-logout-btn"
              onClick={logoutUser} 
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 hover:text-white text-white/60 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="p-1 space-y-3">
            <p className="text-[10px] text-white/40 leading-relaxed font-semibold">Join SoundBox to support artists, write review comments, and compile personal playlists.</p>
            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl mb-1">
              <h4 className="text-[10px] font-bold text-orange-500 uppercase mb-1 italic">Developer Notice</h4>
              <p className="text-[9px] text-orange-500/80 leading-snug">
                Connect to MusisBox persistent Firestore. Deploy via GitHub Actions or Vercel.
              </p>
            </div>
            <button 
              id="sidebar-login-btn"
              onClick={loginWithGoogle} 
              className="w-full flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-400 text-black py-3 rounded-xl text-xs font-black transition-all shadow-lg shadow-orange-500/5 cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Connect with Google</span>
            </button>
          </div>
        )}
      </div>

    </aside>
  );
};
