import React from 'react';
import { Minimap } from './Minimap.jsx';
import { Volume2, VolumeX, Menu, Monitor, Sparkles, Compass, ChevronRight, Bot } from 'lucide-react';
import { soundManager } from '../../systems/audioSystem.js';

export const GameHUD = ({
  playerPos,
  activeQuest,
  completedQuests,
  interactionPrompt,
  isMuted,
  onToggleMute,
  onOpenPauseMenu,
  onSwitchTo2D,
  onTriggerInteraction,
  onRobotAction
}) => {
  // Robot nav buttons: label, animation action for Bolt robot
  const ROBOT_BUTTONS = [
    { label: 'Home',     icon: '🏛️', action: 'wave',  tip: 'Nexus Hub' },
    { label: 'About',   icon: '🏢', action: 'point', tip: 'Executive Studio' },
    { label: 'Projects',icon: '⚡', action: 'jump',  tip: 'Innovation Gallery' },
    { label: 'Skills',  icon: '✦',  action: 'dance', tip: 'Technology Atrium' },
    { label: 'Contact', icon: '🛰️', action: 'spin',  tip: 'Executive Comms' },
  ];

  return (
    <div className="hud-layer">
      {/* Top Header */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Player Status Badge & Quest Overview */}
        <div className="flex flex-col gap-2">
          <div className="glass-panel px-4 py-2.5 flex items-center gap-3 border-l-4 border-cyan-400">
            <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-400 text-sm shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-white tracking-wide text-sm">MOULI</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  LVL 99 ARCHITECT
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                FULL STACK &amp; 3D SYSTEMS
              </div>
            </div>
          </div>

          {/* Active Quest Card */}
          {activeQuest && (
            <div className="glass-panel px-4 py-3 max-w-[290px] border-l-4 border-amber-400/80">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1">
                  <Sparkles size={13} /> CURRENT OBJECTIVE
                </span>
                <span>{activeQuest.index} / 7</span>
              </div>
              <div className="font-semibold text-white text-sm leading-snug">
                {activeQuest.title}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {activeQuest.description}
              </p>
              <div className="text-[10px] text-cyan-400/80 font-mono mt-2 flex items-center gap-1">
                <Compass size={11} /> {activeQuest.hint}
              </div>
            </div>
          )}
        </div>

        {/* Top Right: Actions & Minimap */}
        <div className="flex items-start gap-3.5 hud-interactive">
          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className="glass-panel p-2.5 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* 2D Fallback Switch */}
          <button
            onClick={onSwitchTo2D}
            className="cyber-btn text-xs py-2 px-3 flex items-center gap-1.5"
            title="Switch to 2D Classic Portfolio"
          >
            <Monitor size={14} />
            <span className="hidden sm:inline">CLASSIC 2D</span>
          </button>

          {/* Pause Menu Trigger */}
          <button
            onClick={onOpenPauseMenu}
            className="glass-panel p-2.5 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-all flex items-center gap-1.5"
            title="Pause Menu [ESC]"
          >
            <Menu size={18} />
            <span className="text-[11px] font-mono hidden md:inline">MENU [ESC]</span>
          </button>

          {/* Minimap Radar */}
          <Minimap playerPos={playerPos} />
        </div>
      </div>

      {/* Contextual Interaction Prompt (Center Bottom) */}
      {interactionPrompt && (
        <div className="interaction-prompt-container hud-interactive" onClick={onTriggerInteraction}>
          <div className="glass-panel glass-panel-cyan px-5 py-2.5 flex items-center gap-3 cursor-pointer select-none">
            <span className="keycap">E</span>
            <span className="font-mono text-sm tracking-wider font-semibold text-white">
              {interactionPrompt.prompt || 'INTERACT'}
            </span>
            <ChevronRight size={16} className="text-cyan-400 animate-pulse" />
          </div>
          <span className="text-[10px] text-cyan-400/70 font-mono">
            PRESS [E] OR CLICK TO ACTIVATE
          </span>
        </div>
      )}

      {/* Bottom Row: Controls hint + Robot Nav + Status */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Keyboard hint */}
        <div className="glass-panel px-3.5 py-2 text-[11px] font-mono text-slate-400 flex items-center gap-3 hidden md:flex">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/15">WASD</span>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/15">SHIFT</span>
            <span>Sprint</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/15">SPACE</span>
            <span>Jump</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/15">MOUSE</span>
            <span>Look</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">E</span>
            <span>Interact</span>
          </div>
        </div>

        {/* Bottom Center: Bolt Robot Navigation Bar */}
        {onRobotAction && (
          <div className="robot-nav-bar hud-interactive">
            <div className="robot-nav-label">
              <Bot size={11} />
              <span>BOLT CONTROLS</span>
            </div>
            <div className="robot-nav-buttons">
              {ROBOT_BUTTONS.map(btn => (
                <button
                  key={btn.label}
                  id={`robot-nav-${btn.label.toLowerCase()}`}
                  className="robot-nav-btn"
                  title={`${btn.tip} \u2014 makes Bolt ${btn.action}`}
                  onClick={() => onRobotAction(btn.action)}
                >
                  <span className="robot-nav-icon">{btn.icon}</span>
                  <span className="robot-nav-text">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="glass-panel px-3 py-1.5 text-[10px] font-mono text-slate-500">
          MOULI_PORTFOLIO_WORLD // 60 FPS // READY
        </div>
      </div>
    </div>
  );
};
