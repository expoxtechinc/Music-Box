import React, { useState } from "react";
import { ShieldAlert, Copy, ExternalLink, X, Check, BookOpen, KeyRound } from "lucide-react";
import { useApp } from "../context/AppContext";

export const AuthTroubleshootingModal: React.FC = () => {
  const { authError, clearAuthError } = useApp();
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedPre, setCopiedPre] = useState(false);

  if (!authError) return null;

  const isUnauthorizedDomain = authError.code === "auth/unauthorized-domain";

  // Compute domains based on current page address to make whitelisting failure-proof
  const devDomain = authError.host;
  const preDomain = authError.host.replace("-dev-", "-pre-");

  const copyToClipboard = (text: string, type: "dev" | "pre") => {
    navigator.clipboard.writeText(text);
    if (type === "dev") {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2000);
    } else {
      setCopiedPre(true);
      setTimeout(() => setCopiedPre(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-sans animate-fade-in" id="auth-troubleshooting-modal">
      <div className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar">
        
        {/* Close Button */}
        <button 
          onClick={clearAuthError}
          className="absolute right-5 top-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
              {isUnauthorizedDomain ? "Security Domain Restriction" : "Authentication Exception"}
            </h3>
            <p className="text-xs text-red-400 font-mono mt-1 font-semibold">{authError.code}</p>
          </div>
        </div>

        {isUnauthorizedDomain ? (
          <div className="space-y-6">
            <p className="text-sm text-white/70 leading-relaxed font-semibold">
              Firebase Authentication protects your app by whitelisting only verified origins. Because you are testing your application on AI Studio's dynamic preview channels, this host domain was requested but is not in your authorized list yet.
            </p>

            {/* Step List */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <h4 className="text-xs font-black text-white/40 uppercase tracking-wider italic">Action Instructions</h4>
              
              <div className="space-y-3.5">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center text-orange-500 text-[10px] font-bold font-mono min-w-5 shrink-0 select-none">
                    1
                  </div>
                  <div className="text-xs text-white/80 leading-relaxed font-semibold">
                    Open your project setup directly in the Firebase Web Console:
                    <a 
                      href="https://console.firebase.google.com/project/musisbox-bb10d/authentication/settings" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-400 hover:underline ml-1.5 font-bold cursor-pointer"
                    >
                      {"Auth → Settings Console"}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center text-orange-500 text-[10px] font-bold font-mono min-w-5 shrink-0 select-none">
                    2
                  </div>
                  <div className="text-xs text-white/80 leading-relaxed font-semibold">
                    Locate the <span className="text-white font-bold font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase text-[9px]">Authorized Domains</span> configuration box under Settings.
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center text-orange-500 text-[10px] font-bold font-mono min-w-5 shrink-0 select-none">
                    3
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-white/80 leading-relaxed font-semibold">
                      Click <span className="text-white font-bold">"Add domain"</span> and whitelist BOTH the development and production sandbox channels listed below:
                    </p>
                    
                    {/* Dev Domain Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 bg-black border border-white/5 px-3 py-2 rounded-xl">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-wider italic shrink-0">Development preview</span>
                        <code className="text-xs text-orange-500 truncate font-mono select-all ml-2 flex-1 text-right">{devDomain}</code>
                        <button 
                          onClick={() => copyToClipboard(devDomain, "dev")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
                          title="Copy domain"
                        >
                          {copiedDev ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Share Domain Box */}
                      <div className="flex items-center justify-between gap-3 bg-black border border-white/5 px-3 py-2 rounded-xl">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-wider italic shrink-0">Shared preview</span>
                        <code className="text-xs text-orange-500 truncate font-mono select-all ml-2 flex-1 text-right">{preDomain}</code>
                        <button 
                          onClick={() => copyToClipboard(preDomain, "pre")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
                          title="Copy domain"
                        >
                          {copiedPre ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center text-orange-500 text-[10px] font-bold font-mono min-w-5 shrink-0 select-none">
                    4
                  </div>
                  <div className="text-xs text-white/80 leading-relaxed font-semibold">
                    Once added, refresh this application view and click <span className="text-orange-500 font-bold">Connect with Google</span> again!
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/70 leading-relaxed font-semibold">
              An unexpected validation exception was returned during Google authentication. Please review details below:
            </p>
            <div className="bg-black/50 border border-white/10 rounded-2xl p-4 font-mono text-xs text-red-400 overflow-x-auto select-text break-words">
              {authError.message}
            </div>
          </div>
        )}

        {/* Footer info panels */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-white/5 justify-between">
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-medium">
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span>Project Target ID: musisbox-bb10d</span>
          </div>
          
          <button 
            onClick={clearAuthError}
            className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer text-center"
          >
            Acknowledge & Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
