import React, { useState, useEffect } from "react";
import { Send, MessageSquare, Trash2, Smile, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Comment } from "../types";

interface CommentSectionProps {
  trackId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ trackId }) => {
  const { user, userProfile, addComment, deleteComment, getTrackComments, isAdmin } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Sync the comments in real-time
    const unsubscribe = getTrackComments(trackId, (fetchedComments) => {
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [trackId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Sign in to share your thoughts with the community!");
      return;
    }
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    try {
      await addComment(trackId, newCommentText);
      setNewCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Are you sure you want to delete your review comment?")) {
      try {
        await deleteComment(trackId, commentId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getRelativeTime = (timestamp: any) => {
    if (!timestamp) return "just now";
    
    // Check if it's a Firestore timestamp (has seconds)
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0C0C0C] border border-white/10 rounded-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-black p-4 border-b border-white/10 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider italic">Comments ({comments.length})</h4>
        </div>
      </div>

      {/* Stream Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar min-h-[160px]">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-8 h-8 text-white/30 mb-2" />
            <p className="text-xs text-white/40 font-medium">Be the first to drop a comment or feedback on this song!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user?.uid === comment.userId;
            const canDelete = isOwner || isAdmin;
            
            return (
              <div 
                key={comment.id} 
                className="flex gap-3 group items-start"
              >
                <img 
                  src={comment.userPhotoURL} 
                  alt="" 
                  className="w-8 h-8 rounded-full border border-white/10 bg-[#0C0C0C] shrink-0"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-orange-500 truncate">{comment.userDisplayName}</span>
                    <span className="text-[9px] text-white/40 shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-white/80 font-sans mt-1 leading-relaxed break-words whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {canDelete && (
                    <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-white/40 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Form */}
      <div className="bg-black border-t border-white/10 p-3 shrink-0">
        {user ? (
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input 
              type="text"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Drop your comment..."
              className="flex-1 bg-white/5 border border-white/10 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={submitting || !newCommentText.trim()}
              className="bg-orange-500 hover:bg-orange-400 text-black p-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer text-xs font-black italic shadow-lg shadow-orange-500/10"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <p className="text-[11px] text-white/40 leading-relaxed font-semibold">
              Please log in to participate in the conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
