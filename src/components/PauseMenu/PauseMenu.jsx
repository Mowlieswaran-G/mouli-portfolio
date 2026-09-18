import React, { useState } from 'react';
import { X, Play, MapPin, Volume2, VolumeX, FileDown, Monitor, Sparkles, RefreshCw } from 'lucide-react';
import { soundManager } from '../../systems/audioSystem.js';

export const PauseMenu = ({
  isOpen,
  onClose,
  onTeleport,
  onSwitchTo2D,
  isMuted,
  onToggleMute,
  onResetProgress
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('menu');

  const fastTravelLocations = [
    { name: 'Spawn Plaza Hub', pos: [0, 0, 8], icon: '🏛️' },
    { name: "The Creator's House", pos: [-24, 0, 0], icon: '🏠' },
    { name: 'Project Research Lab', pos: [0, 0, -28], icon: '💻' },
    { name: 'Skill Interactive Arena', pos: [22, 0, 0], icon: '✦' },
    { name: 'Hall of Milestones', pos: [18, 0, -22], icon: '🏆' },
    { name: 'Flagship Core Spire', pos: [0, 0, -58], icon: '⚡' },
    { name: 'Contact Comms Deck', pos: [0, 0, 24], icon: '🛰️' }
  ];

  const handleDownloadResume = () => {
    soundManager.playClick();
    const resumeContent = `# MOULI
Full Stack Systems Architect & Creative Technologist
Email: mouli.tech.contact@gmail.com | Portfolio: 3D Interactive World

## SUMMARY
Accomplished Full Stack Software Engineer specializing in modern reactive architectures, distributed backend services, high-concurrency real-time systems, and immersive WebGL 3D computing.

## CORE SKILLS
- Languages: TypeScript, JavaScript, Python, Go, Rust, SQL, GLSL
- Frontend: React 19, Next.js, Three.js, WebGL, Tailwind CSS, Vite
- Backend: Node.js, FastAPI, Go, GraphQL, gRPC, Redis, PostgreSQL
- Cloud & DevOps: Docker, Kubernetes, AWS, Terraform, CI/CD, Prometheus
- Systems & AI: Autonomous Multi-Agent Swarms, RAG Semantic Search, WebRTC
`;
    const blob = new Blob([resumeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mouli_FullStack_Resume.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel glass-panel-cyan w-full max-w-lg p-6 relative border-t-4 border-cyan-400"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="font-mono text-sm uppercase tracking-widest text-cyan-400 font-bold">
              SYSTEM PAUSED
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'menu'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            COMMAND MENU
          </button>
          <button
            onClick={() => setActiveTab('fast-travel')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'fast-travel'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            FAST TRAVEL
          </button>
        </div>

        {activeTab === 'menu' ? (
          <div className="space-y-2.5">
            <button
              onClick={onClose}
              className="dialogue-choice-btn w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2 font-mono text-sm font-semibold text-cyan-300">
                <Play size={16} /> RESUME WORLD
              </span>
              <span className="text-[10px] font-mono text-slate-500">[ESC]</span>
            </button>

            <button
              onClick={handleDownloadResume}
              className="dialogue-choice-btn w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2 font-mono text-sm text-amber-300">
                <FileDown size={16} /> DOWNLOAD RESUME
              </span>
              <span className="text-[10px] font-mono text-slate-500">.MD SPEC</span>
            </button>

            <button
              onClick={onSwitchTo2D}
              className="dialogue-choice-btn w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2 font-mono text-sm text-pink-300">
                <Monitor size={16} /> SWITCH TO 2D CLASSIC PORTFOLIO
              </span>
              <span className="text-[10px] font-mono text-slate-500">HTML VIEW</span>
            </button>

            <button
              onClick={onToggleMute}
              className="dialogue-choice-btn w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2 font-mono text-sm text-slate-200">
                {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
                AUDIO: {isMuted ? "MUTED" : "ENABLED"}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">TOGGLE</span>
            </button>

            <button
              onClick={onResetProgress}
              className="dialogue-choice-btn w-full flex items-center justify-between opacity-70 hover:opacity-100"
            >
              <span className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <RefreshCw size={14} /> RESET QUEST JOURNEY
              </span>
              <span className="text-[10px] font-mono text-slate-500">LOCAL</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase mb-2">
              SELECT SECTOR TO INSTANTLY TELEPORT
            </div>
            {fastTravelLocations.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playDiscovery();
                  onTeleport(...loc.pos);
                  onClose();
                }}
                className="dialogue-choice-btn w-full text-xs py-2 px-3 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span>{loc.icon}</span>
                  <span className="font-mono text-white">{loc.name}</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">JUMP ➔</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>PORTFOLIO OS // V1.0</span>
          <span>PRESS ESC TO RESUME</span>
        </div>
      </div>
    </div>
  );
};
