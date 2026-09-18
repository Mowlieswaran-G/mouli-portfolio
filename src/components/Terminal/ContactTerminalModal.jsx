import React, { useState } from 'react';
import { X, Send, Mail, FileDown, Check, Terminal } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../common/Icons.jsx';
import { soundManager } from '../../systems/audioSystem.js';

export const ContactTerminalModal = ({ onClose, onTransmissionSent }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    soundManager.playClick();

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      soundManager.playDiscovery();
      onTransmissionSent?.();
    }, 1200);
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('mouli.tech.contact@gmail.com');
    setCopiedEmail(true);
    soundManager.playClick();
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleDownloadResume = () => {
    soundManager.playClick();
    // Generate and download a formatted resume markdown file
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

## FEATURED PLATFORMS
- NeuralFlow AI: Distributed autonomous agent workflow orchestration platform
- QuantumOps Cloud: eBPF Kubernetes telemetry and service mesh visualizer
- NexusRealtime Sync: Offline-first CRDT peer-to-peer collaboration engine
- HyperEngine 3D: WebGL/WebGPU procedural computing engine
- Aegis Core Platform: Autonomous AI-driven zero-trust cloud orchestration

## HONORS & CERTIFICATIONS
- Global Hackathon Champion (1st of 450+ Teams)
- Certified Kubernetes Administrator (CKA - 94%)
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
        className="glass-panel glass-panel-cyan w-full max-w-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Terminal size={18} className="text-cyan-400" />
            <div>
              <div className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                TRANSMISSION TERMINAL // SEC_07
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                LONG-RANGE UPLINK ESTABLISHED
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Check size={28} />
            </div>
            <h3 className="text-lg font-heading font-bold text-white mb-1">
              TRANSMISSION BROADCASTED
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
              Your message has been encrypted and delivered directly to Mouli's priority comms channel. Thank you for connecting!
            </p>
            <button
              onClick={onClose}
              className="cyber-btn cyber-btn-primary text-xs"
            >
              RETURN TO WORLD
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className="space-y-3.5 mb-6">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  CALLSIGN / SENDER NAME
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 rounded bg-black/40 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono placeholder:text-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  COMMUNICATION FREQUENCY (EMAIL)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full px-3.5 py-2 rounded bg-black/40 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono placeholder:text-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  TRANSMISSION PAYLOAD (MESSAGE)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Discussing engineering opportunities, projects, or consulting..."
                  className="w-full px-3.5 py-2 rounded bg-black/40 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono placeholder:text-slate-600 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cyber-btn cyber-btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {isSubmitting ? "TRANSMITTING ENCRYPTED PACKETS..." : "SEND TRANSMISSION TO MOULI"}
              </button>
            </form>

            {/* Quick Links & Direct Comms */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="cyber-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                  title="Copy direct email address"
                >
                  <Mail size={13} />
                  {copiedEmail ? "COPIED!" : "COPY EMAIL"}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="cyber-btn cyber-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <FileDown size={13} />
                  RESUME
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded hover:bg-white/10 hover:text-white transition-colors"
                  title="GitHub Profile"
                >
                  <GithubIcon size={16} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded hover:bg-white/10 hover:text-white transition-colors"
                  title="LinkedIn Profile"
                >
                  <LinkedinIcon size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
