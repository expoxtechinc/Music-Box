import React, { useState } from "react";
import { Plus, X, ListMusic, Music, ToggleLeft, ToggleRight } from "lucide-react";
import { useApp } from "../context/AppContext";

interface PlaylistModalProps {
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ onClose }) => {
  const { createPlaylist, playlists, user } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a name for the playlist.");
      return;
    }
    if (!user) {
      alert("Sign in to compose personal music playlists.");
      return;
    }

    setLoading(true);
    try {
      await createPlaylist(title.trim(), description.trim(), isPublic);
      setTitle("");
      setDescription("");
      alert("Playlist constructed successfully!");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-55 flex items-center justify-center p-4 backdrop-blur-sm font-sans animate-fade-in">
      <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-black p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-black text-white uppercase italic">Create New Playlist</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Playlist Name *</label>
            <input 
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Late Night Vibes"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-white/40 uppercase mb-2 italic">Description</label>
            <textarea 
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What kind of feeling does this playlist convey?"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/10">
            <div>
              <p className="text-xs font-bold text-white">Public Playlist</p>
              <p className="text-[10px] text-white/40 mt-0.5">Let other listeners find and stream this collection</p>
            </div>
            
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className="text-orange-500 focus:outline-none cursor-pointer"
            >
              {isPublic ? (
                <ToggleRight className="w-9 h-9 stroke-[1.5]" />
              ) : (
                <ToggleLeft className="w-9 h-9 stroke-[1.5] text-white/20" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black italic text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Playlist</span>
              </>
            )}
          </button>
        </form>

        {/* Existing Playlists list summary */}
        {playlists.length > 0 && (
          <div className="border-t border-white/10 px-6 py-4 bg-black/30">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-wider mb-2 italic">Existing Compilations ({playlists.filter(p => p.creatorId === user?.uid).length})</p>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {playlists
                .filter(pl => pl.creatorId === user?.uid)
                .map(pl => (
                  <div key={pl.id} className="flex items-center gap-2 py-1 text-xs text-white/60">
                    <Music className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-medium truncate">{pl.title}</span>
                    <span className="text-[9px] text-white/30 ml-auto font-mono">({pl.trackIds.length} songs)</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
