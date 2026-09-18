import { X, ExternalLink, FileText, CheckCircle, Cpu, Layers, Trophy } from 'lucide-react';
import { GithubIcon } from '../common/Icons.jsx';
import { soundManager } from '../../systems/audioSystem.js';

export const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel glass-panel-cyan w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded uppercase font-semibold tracking-wider"
                style={{
                  backgroundColor: `${project.color}22`,
                  color: project.color,
                  border: `1px solid ${project.color}55`
                }}
              >
                {project.category}
              </span>
              <span className="text-[11px] font-mono text-slate-400">LAB EXHIBIT // 01</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-white tracking-wide">
              {project.name}
            </h2>
            <p className="text-sm text-cyan-400/90 font-mono mt-0.5">
              {project.tagline}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Project Description */}
        <div className="text-sm text-slate-300 leading-relaxed mb-5">
          {project.description}
        </div>

        {/* Tech Stack Pills */}
        <div className="mb-5">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Cpu size={14} className="text-cyan-400" /> SYSTEM TECHNOLOGIES
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Role & Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10">
            <div className="text-xs font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Layers size={13} className="text-cyan-400" /> ENGINEERING ROLE
            </div>
            <div className="text-sm font-medium text-white">
              {project.role}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10">
            <div className="text-xs font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Trophy size={13} className="text-amber-400" /> MEASURABLE IMPACT
            </div>
            <div className="text-xs text-slate-300 leading-normal">
              {project.result}
            </div>
          </div>
        </div>

        {/* Architecture Highlights */}
        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-400" /> KEY ARCHITECTURE HIGHLIGHTS
          </div>
          <div className="space-y-1.5">
            {project.keyFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-cyan-400 font-mono mt-0.5">•</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundManager.playClick()}
              className="cyber-btn cyber-btn-primary text-xs"
            >
              <ExternalLink size={14} />
              LIVE DEMO
            </a>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundManager.playClick()}
              className="cyber-btn text-xs"
            >
              <GithubIcon size={14} />
              SOURCE REPO
            </a>
          </div>

          <button
            onClick={onClose}
            className="cyber-btn text-xs text-slate-400 hover:text-white"
          >
            RETURN TO EXPLORATION
          </button>
        </div>
      </div>
    </div>
  );
};
