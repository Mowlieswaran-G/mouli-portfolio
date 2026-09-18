import React, { useEffect } from 'react';
import { X, Trophy, Award, Star, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AchievementModal = ({ achievement, onClose }) => {
  if (!achievement) return null;

  useEffect(() => {
    // Triumphant confetti burst
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ffb703', '#ff007f']
      });
    } catch (e) {}
  }, []);

  const renderIcon = () => {
    switch (achievement.icon) {
      case 'trophy': return <Trophy size={28} className="text-amber-400" />;
      case 'shield-check': return <ShieldCheck size={28} className="text-emerald-400" />;
      case 'award': return <Award size={28} className="text-pink-400" />;
      default: return <Star size={28} className="text-cyan-400" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md p-6 relative border-t-4 text-center"
        style={{ borderColor: achievement.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Floating Trophy Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-[0_0_24px_rgba(255,183,3,0.3)]">
          {renderIcon()}
        </div>

        <div className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold mb-1">
          ACHIEVEMENT UNLOCKED
        </div>

        <h2 className="text-xl font-heading font-bold text-white tracking-wide mb-1">
          {achievement.title}
        </h2>

        <div className="text-xs font-mono text-slate-400 mb-4">
          {achievement.issuer} • {achievement.year}
        </div>

        <div className="py-2.5 px-4 rounded-lg bg-white/[0.03] border border-white/10 mb-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">KEY METRIC</span>
          <span className="text-base font-bold text-cyan-400 font-mono">
            {achievement.stat}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          {achievement.description}
        </p>

        <button
          onClick={onClose}
          className="cyber-btn cyber-btn-primary w-full text-xs"
        >
          CLAIM ACHIEVEMENT
        </button>
      </div>
    </div>
  );
};
