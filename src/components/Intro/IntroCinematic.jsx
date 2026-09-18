import React, { useState, useEffect } from 'react';
import { Play, Monitor, Sparkles, ChevronRight } from 'lucide-react';
import { soundManager } from '../../systems/audioSystem.js';

export const IntroCinematic = ({ onStartGame, onSwitchTo2D }) => {
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    // Ultra-snappy cyber boot sequence (fast feedback without waiting 2.8s)
    const t1 = setTimeout(() => setBootStep(1), 100);
    const t2 = setTimeout(() => setBootStep(2), 250);
    const t3 = setTimeout(() => setBootStep(3), 450);

    // Preload 3D GameEngine & Classic Portfolio in background while user views intro
    const preloadAssets = () => {
      import('../../game/GameEngine.js').catch(() => {});
      import('../Fallback/ClassicPortfolio.jsx').catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadAssets);
    } else {
      setTimeout(preloadAssets, 50);
    }

    const handleKeyDown = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        soundManager.init();
        soundManager.playDiscovery();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onStartGame]);

  const handleStart = () => {
    soundManager.init();
    soundManager.playDiscovery();
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#04060b] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Terminal Boot Lines */}
        <div className="w-full text-left font-mono text-xs text-slate-500 mb-8 space-y-1.5 border-l-2 border-cyan-500/40 pl-3">
          <div className="text-cyan-400/90 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            &gt; SYSTEM INITIALIZING...
          </div>
          {bootStep >= 1 && (
            <div className="text-emerald-400/90">
              &gt; NEURAL GRAPH ENGINE LOADED [OK]
            </div>
          )}
          {bootStep >= 2 && (
            <div className="text-cyan-300">
              &gt; WORLD CONNECTION ESTABLISHED [PORT 60FPS]
            </div>
          )}
        </div>

        {/* Title Presentation */}
        <div className={`transition-all duration-700 ${bootStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase font-semibold mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} /> IMMERSIVE 3D EXPERIENCE
          </div>

          <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-white tracking-widest mb-2 shadow-sm">
            M O U L I
          </h1>

          <div className="text-xs md:text-sm font-mono text-slate-400 tracking-[0.2em] uppercase mb-8">
            DEVELOPER • CREATOR • BUILDER
          </div>
        </div>

        {/* Action Controls */}
        <div className={`flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-xs transition-all duration-700 ${bootStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleStart}
            className="cyber-btn cyber-btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 group"
          >
            <Play size={16} className="group-hover:scale-110 transition-transform" />
            <span>ENTER WORLD</span>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={onSwitchTo2D}
            className="cyber-btn w-full py-3 text-xs flex items-center justify-center gap-2 text-slate-400 hover:text-white"
          >
            <Monitor size={15} />
            <span>CLASSIC 2D MODE</span>
          </button>
        </div>

        <div className={`text-[11px] font-mono text-slate-600 mt-6 transition-all duration-700 ${bootStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          PRESS [ENTER] OR TAP TO EXPLORE
        </div>
      </div>
    </div>
  );
};
