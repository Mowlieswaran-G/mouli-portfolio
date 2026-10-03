import React, { useState, useEffect } from 'react';
import { Play, Monitor, Sparkles, ChevronRight } from 'lucide-react';
import { soundManager } from '../../systems/audioSystem.js';

export const IntroCinematic = ({ onStartGame, onSwitchTo2D, isEngineReady }) => {
  const [bootStep, setBootStep] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    // Ultra-snappy cyber boot sequence (fast feedback without long artificial pauses)
    const t1 = setTimeout(() => setBootStep(1), 60);
    const t2 = setTimeout(() => setBootStep(2), 160);
    const t3 = setTimeout(() => setBootStep(3), 280);

    const handleKeyDown = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleStart = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    soundManager.init();
    soundManager.playDiscovery();
    onStartGame();
  };

  return (
    <div className={`fixed inset-0 z-50 bg-[#04060b]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none transition-opacity duration-300 ${isLaunching ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Terminal Boot Lines */}
        <div className="w-full text-left font-mono text-xs text-slate-500 mb-8 space-y-1.5 border-l-2 border-cyan-500/40 pl-3">
          <div className="text-cyan-400/90 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            &gt; SYSTEM INITIALIZING...
          </div>
          {bootStep >= 1 && (
            <div className="text-emerald-400/90 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              &gt; NEURAL GRAPH ENGINE LOADED [OK]
            </div>
          )}
          {bootStep >= 2 && (
            <div className={`flex items-center gap-2 ${isEngineReady ? 'text-cyan-300 font-semibold' : 'text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isEngineReady ? 'bg-cyan-400 animate-ping' : 'bg-slate-500 animate-pulse'}`}></span>
              &gt; {isEngineReady ? '3D WORLD READY [INSTANT LAUNCH • 60FPS]' : 'WARMING 3D WORLD MATRIX...'}
            </div>
          )}
        </div>

        {/* Title Presentation */}
        <div className={`transition-all duration-500 ${bootStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
        <div className={`flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-xs transition-all duration-500 ${bootStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleStart}
            className="cyber-btn cyber-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 group shadow-[0_0_24px_rgba(0,240,255,0.25)] hover:shadow-[0_0_32px_rgba(0,240,255,0.45)]"
          >
            <Play size={16} className="group-hover:scale-110 transition-transform fill-current" />
            <span className="font-bold tracking-wider">ENTER WORLD</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onSwitchTo2D}
            className="cyber-btn w-full py-3 text-xs flex items-center justify-center gap-2 text-slate-400 hover:text-white"
          >
            <Monitor size={15} />
            <span>CLASSIC 2D MODE</span>
          </button>
        </div>

        <div className={`text-[11px] font-mono text-slate-500 mt-6 transition-all duration-500 ${bootStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          PRESS [ENTER] OR TAP TO EXPLORE
        </div>
      </div>
    </div>
  );
};
