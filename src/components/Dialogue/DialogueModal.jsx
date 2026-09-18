import React, { useState, useEffect } from 'react';
import { MOULI_DIALOGUE } from '../../data/dialogue.js';
import { soundManager } from '../../systems/audioSystem.js';
import { MessageSquare, X, ChevronRight } from 'lucide-react';

export const DialogueModal = ({ onClose, onCompleteObjective }) => {
  const [currentNodeKey, setCurrentNodeKey] = useState('start');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentNode = MOULI_DIALOGUE[currentNodeKey] || MOULI_DIALOGUE.start;

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    const fullText = currentNode.text;
    const timer = setInterval(() => {
      index++;
      setDisplayedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [currentNodeKey]);

  const handleSelectOption = (option) => {
    soundManager.playClick();
    if (option.next === 'close') {
      onCompleteObjective?.();
      onClose();
    } else if (MOULI_DIALOGUE[option.next]) {
      setCurrentNodeKey(option.next);
      onCompleteObjective?.();
    } else {
      onClose();
    }
  };

  const skipTyping = () => {
    if (isTyping) {
      setDisplayedText(currentNode.text);
      setIsTyping(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={skipTyping}>
      <div
        className="glass-panel dialogue-card relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-400/50 flex items-center justify-center text-cyan-400 font-bold font-mono shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-white tracking-wide text-base">
                  {currentNode.speaker}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {currentNode.title}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">CREATOR & FULL STACK ARCHITECT</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dialogue Text */}
        <div className="min-h-[75px] text-slate-200 text-sm md:text-base leading-relaxed font-sans mb-6">
          {displayedText}
          {isTyping && <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />}
        </div>

        {/* Options */}
        <div className="dialogue-choices">
          {currentNode.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={isTyping}
              onClick={() => handleSelectOption(opt)}
              className="dialogue-choice-btn group disabled:opacity-50 disabled:cursor-default"
            >
              <span className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform">
                  [0{idx + 1}]
                </span>
                <span>{opt.text}</span>
              </span>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          ))}
        </div>

        {/* Bottom footer hint */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Click anywhere to fast-forward text</span>
          <span>ESC to exit conversation</span>
        </div>
      </div>
    </div>
  );
};
