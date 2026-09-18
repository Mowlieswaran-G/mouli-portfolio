import React from 'react';
import { X, Sparkles, Code2, Layers } from 'lucide-react';

export const SkillModal = ({ skill, onClose }) => {
  if (!skill) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-lg p-6 relative border-l-4"
        style={{ borderColor: skill.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {skill.category}
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                style={{
                  backgroundColor: `${skill.color}22`,
                  color: skill.color,
                  border: `1px solid ${skill.color}44`
                }}
              >
                {skill.level}
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold text-white tracking-wide">
              {skill.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          {skill.description}
        </p>

        {/* Tools & Frameworks */}
        <div className="mb-5">
          <div className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
            <Code2 size={14} className="text-cyan-400" /> PRODUCTION TOOLING
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skill.tools.map((tool, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-slate-200"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Related Projects */}
        <div className="mb-5">
          <div className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers size={14} className="text-amber-400" /> APPLIED IN PROJECTS
          </div>
          <div className="flex flex-wrap gap-2">
            {skill.relatedProjects.map((pName, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300"
              >
                {pName}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="cyber-btn cyber-btn-primary text-xs"
          >
            CONFIRM & CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};
