import React, { useState } from 'react';
import { PROJECTS_DATA } from '../../data/projects.js';
import { SKILLS_DATA } from '../../data/skills.js';
import { ACHIEVEMENTS_DATA } from '../../data/achievements.js';
import {
  Gamepad2,
  ExternalLink,
  Mail,
  FileDown,
  Terminal,
  Code2,
  Cpu,
  Trophy,
  Layers,
  Sparkles,
  Send,
  Check
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../common/Icons.jsx';
import { soundManager } from '../../systems/audioSystem.js';

export const ClassicPortfolio = ({ onReturnTo3D }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const categories = ['all', 'AI & Distributed Systems', 'Cloud Native & DevOps', 'Real-time & Web Systems', 'Creative Tech & Graphics'];

  const filteredProjects = activeFilter === 'all'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category === activeFilter || (activeFilter === 'AI & Distributed Systems' && p.id === 'proj-boss'));

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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    soundManager.playDiscovery();
  };

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-100 overflow-y-auto selection:bg-cyan-500 selection:text-black">
      {/* Top Floating Navigation */}
      <nav className="sticky top-0 z-40 bg-[#06080f]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-400 text-sm shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            M
          </div>
          <div>
            <span className="font-heading font-bold text-white tracking-wider text-base">MOULI</span>
            <span className="text-[11px] text-cyan-400 font-mono block">SYSTEMS ARCHITECT & CREATOR</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
            <a href="#about" className="hover:text-cyan-400 transition-colors">ABOUT</a>
            <a href="#projects" className="hover:text-cyan-400 transition-colors">PROJECTS</a>
            <a href="#skills" className="hover:text-cyan-400 transition-colors">SKILLS</a>
            <a href="#achievements" className="hover:text-cyan-400 transition-colors">AWARDS</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">CONTACT</a>
          </div>

          <button
            onClick={onReturnTo3D}
            className="cyber-btn cyber-btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <Gamepad2 size={15} />
            <span>RETURN TO 3D GAME</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-24">
        {/* Hero Section */}
        <section id="about" className="pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Sparkles size={13} />
            <span>AVAILABLE FOR SENIOR & ARCHITECT OPPORTUNITIES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight mb-6 leading-tight">
            Building scalable distributed backends, intelligent swarms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">next-gen 3D web experiences.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mb-8">
            Hello! I am <strong className="text-white">Mouli</strong>. I bridge computational rigor with immersive creative technology. With deep experience across high-concurrency systems, Kubernetes observability, and WebGL graphics engines, I build software that performs under load and delights users at first glance.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#projects" className="cyber-btn cyber-btn-primary text-xs py-3 px-5">
              EXPLORE FEATURED WORK
            </a>
            <button
              onClick={handleDownloadResume}
              className="cyber-btn text-xs py-3 px-5 flex items-center gap-2"
            >
              <FileDown size={15} />
              DOWNLOAD RESUME
            </button>
            <button
              onClick={onReturnTo3D}
              className="cyber-btn cyber-btn-secondary text-xs py-3 px-5 flex items-center gap-2"
            >
              <Gamepad2 size={15} />
              ENTER 3D GAME WORLD
            </button>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Cpu size={14} /> ENGINEERING SHOWCASE
              </div>
              <h2 className="text-3xl font-heading font-bold text-white">
                Featured Projects & Platforms
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                    activeFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'ALL WORK' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="glass-panel p-6 rounded-xl flex flex-col justify-between border-t-2 hover:border-cyan-400/80 transition-all group"
                style={{ borderTopColor: p.color }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: `${p.color}22`, color: p.color }}
                    >
                      {p.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {p.role.split('&')[0]}
                    </span>
                  </div>

                  <h3 className="text-2xl font-heading font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400/90 mb-3">
                    {p.tagline}
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {p.description}
                  </p>

                  <div className="space-y-1 mb-5">
                    {p.keyFeatures.slice(0, 2).map((kf, ki) => (
                      <div key={ki} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-cyan-400 font-mono">•</span>
                        <span>{kf}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.technologies.map((t, ti) => (
                      <span
                        key={ti}
                        className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cyber-btn cyber-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} />
                      LIVE DEMO
                    </a>
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cyber-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <GithubIcon size={13} />
                      CODE
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Code2 size={14} /> TECHNICAL EXPERTISE
          </div>
          <h2 className="text-3xl font-heading font-bold text-white mb-8">
            Skills & Architecture Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKILLS_DATA.map((skill) => (
              <div
                key={skill.id}
                className="glass-panel p-5 rounded-xl border-l-4"
                style={{ borderLeftColor: skill.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {skill.category}
                  </span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: `${skill.color}22`, color: skill.color }}
                  >
                    {skill.level}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-bold text-white mb-2">
                  {skill.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {skill.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {skill.tools.map((t, ti) => (
                    <span
                      key={ti}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section id="achievements">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Trophy size={14} /> RECOGNITION & METRICS
          </div>
          <h2 className="text-3xl font-heading font-bold text-white mb-8">
            Honors, Awards & Milestones
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACHIEVEMENTS_DATA.map((ach) => (
              <div key={ach.id} className="glass-panel p-5 rounded-xl text-center border-t-2" style={{ borderTopColor: ach.color }}>
                <div className="text-2xl font-bold font-mono text-cyan-400 mb-1">
                  {ach.stat}
                </div>
                <h4 className="font-heading font-bold text-white text-sm mb-1">
                  {ach.title}
                </h4>
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  {ach.issuer} ({ach.year})
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  {ach.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="glass-panel glass-panel-cyan p-8 rounded-2xl">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                <Terminal size={14} /> INITIATE TRANSMISSION
              </div>
              <h2 className="text-3xl font-heading font-bold text-white mb-2">
                Connect With Mouli
              </h2>
              <p className="text-sm text-slate-300">
                Interested in high-impact full stack architecture, consulting, or visionary creative builds? Let's talk.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <Check size={24} />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-1">
                  Transmission Delivered!
                </h3>
                <p className="text-xs text-slate-300">
                  Thank you! Mouli will reply to your communication shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Discussing upcoming project initiatives, roles, or creative collabs..."
                    className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="cyber-btn cyber-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  TRANSMIT MESSAGE
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-400" />
                <span>mouli.tech.contact@gmail.com</span>
              </div>

              <div className="flex items-center gap-3">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <GithubIcon size={18} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <LinkedinIcon size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 pb-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} MOULI. ALL RIGHTS RESERVED.
          </div>
          <div>
            ENGINEERED WITH REACT, THREE.JS & CREATIVE PASSION
          </div>
        </footer>
      </main>
    </div>
  );
};
