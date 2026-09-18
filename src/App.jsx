import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { GameHUD } from './components/HUD/GameHUD.jsx';
import { MobileControls } from './components/Controls/MobileControls.jsx';
import { IntroCinematic } from './components/Intro/IntroCinematic.jsx';
import { QUESTS_DATA } from './data/quests.js';
import { soundManager } from './systems/audioSystem.js';
import { loadSaveState, persistSaveState, clearSaveState } from './systems/saveSystem.js';
import { CheckCircle2 } from 'lucide-react';

// Code-split heavy modals and 2D fallback view to drastically reduce initial bundle size
const DialogueModal = lazy(() => import('./components/Dialogue/DialogueModal.jsx').then(m => ({ default: m.DialogueModal })));
const ProjectModal = lazy(() => import('./components/Inspection/ProjectModal.jsx').then(m => ({ default: m.ProjectModal })));
const SkillModal = lazy(() => import('./components/Inspection/SkillModal.jsx').then(m => ({ default: m.SkillModal })));
const AchievementModal = lazy(() => import('./components/Inspection/AchievementModal.jsx').then(m => ({ default: m.AchievementModal })));
const ContactTerminalModal = lazy(() => import('./components/Terminal/ContactTerminalModal.jsx').then(m => ({ default: m.ContactTerminalModal })));
const PauseMenu = lazy(() => import('./components/PauseMenu/PauseMenu.jsx').then(m => ({ default: m.PauseMenu })));
const ClassicPortfolio = lazy(() => import('./components/Fallback/ClassicPortfolio.jsx').then(m => ({ default: m.ClassicPortfolio })));

export default function App() {
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);

  // App & View State
  const [viewMode, setViewMode] = useState('intro'); // 'intro', 'playing', 'classic_2d'
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEngineLoading, setIsEngineLoading] = useState(false);

  // Player position for minimap & HUD
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 8, yaw: 0 });

  // Contextual interaction prompt
  const [interactionPrompt, setInteractionPrompt] = useState(null);

  // Active Modals
  const [activeModal, setActiveModal] = useState(null); // 'dialogue', 'project', 'skill', 'achievement', 'contact', 'easter-egg'
  const [modalData, setModalData] = useState(null);

  // Quests & Save State
  const [saveData, setSaveData] = useState(() => loadSaveState());
  const [toastMessage, setToastMessage] = useState(null);

  // Active quest based on saved index
  const activeQuest = QUESTS_DATA[saveData.activeQuestIndex] || null;

  // Persist state changes
  useEffect(() => {
    persistSaveState(saveData);
  }, [saveData]);

  // Show temporary toast
  const showToast = (title, subtitle) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Complete a quest step
  const advanceQuest = (questIndex) => {
    if (saveData.activeQuestIndex === questIndex) {
      const nextIndex = questIndex + 1;
      const completed = [...saveData.completedQuests, QUESTS_DATA[questIndex].id];
      setSaveData((prev) => ({
        ...prev,
        activeQuestIndex: nextIndex,
        completedQuests: completed
      }));

      soundManager.playQuestComplete();
      showToast("QUEST COMPLETED!", QUESTS_DATA[questIndex].title);

      if (nextIndex >= QUESTS_DATA.length) {
        // Dynamic load confetti only when world completes
        import('canvas-confetti').then(({ default: confetti }) => {
          try {
            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#00f0ff', '#ffb703', '#ff007f']
            });
          } catch (e) {}
        }).catch(() => {});
        showToast("WORLD COMPLETE!", "All major sector objectives achieved.");
      }
    }
  };

  // Dynamically initialize Three.js GameEngine when entering 'playing' mode
  useEffect(() => {
    if (viewMode !== 'playing') return;

    let isMounted = true;

    if (!gameEngineRef.current && canvasRef.current) {
      setIsEngineLoading(true);
      import('./game/GameEngine.js').then(({ GameEngine }) => {
        if (!isMounted || !canvasRef.current) return;
        const engine = new GameEngine(canvasRef.current, {
          onInteractionPrompt: (item) => {
            setInteractionPrompt(item);
          },
          onTriggerInteraction: (item) => {
            handleTriggerInteraction(item);
          },
          onPlayerMove: (pos) => {
            setPlayerPos(pos);
            // Quest 1 trigger: moving in plaza
            if (saveData.activeQuestIndex === 0) {
              if (Math.hypot(pos.x, pos.z - 8) > 3) {
                advanceQuest(0);
              }
            }
          }
        });

        engine.start();
        gameEngineRef.current = engine;
        setIsEngineLoading(false);
      }).catch((err) => {
        console.error("Failed to load GameEngine", err);
        setIsEngineLoading(false);
      });
    }

    return () => {
      isMounted = false;
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, [viewMode]);

  // Handle ESC key for Pause Menu or closing Modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        if (activeModal) {
          closeActiveModal();
        } else if (viewMode === 'playing') {
          setIsPaused((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, viewMode]);

  // Handle interaction with world objects
  const handleTriggerInteraction = (item) => {
    if (!item) return;

    // Cinematic camera focus
    if (gameEngineRef.current) {
      const camTarget = item.position.clone().add({ x: 0, y: 0.8, z: 2.8 });
      gameEngineRef.current.focusCinematicOn(camTarget, item.position);
    }

    if (item.type === 'npc') {
      setActiveModal('dialogue');
      setModalData(item);
      advanceQuest(1); // Quest 2: Talk to Mouli
    } else if (item.type === 'project') {
      setActiveModal('project');
      setModalData(item.data);
      advanceQuest(2); // Quest 3: Discover Lab
      advanceQuest(3); // Quest 4: Inspect Project
    } else if (item.type === 'skill') {
      setActiveModal('skill');
      setModalData(item.data);
      advanceQuest(4); // Quest 5: Discover Skill
    } else if (item.type === 'achievement') {
      setActiveModal('achievement');
      setModalData(item.data);
      advanceQuest(5); // Quest 6: Hall of Milestones
    } else if (item.type === 'contact' || item.type === 'terminal') {
      setActiveModal('contact');
      setModalData(item);
      advanceQuest(6); // Quest 7: Contact Station
    } else if (item.type === 'easter-egg') {
      setActiveModal('easter-egg');
      soundManager.playDiscovery();
      showToast("SECRET UNLOCKED!", "Discovered Mouli's Classified Console!");
    }
  };

  const closeActiveModal = () => {
    setActiveModal(null);
    setModalData(null);
    if (gameEngineRef.current) {
      gameEngineRef.current.restoreCamera();
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleTeleport = (x, y, z) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.teleportPlayer(x, y, z);
    }
  };

  const handleResetProgress = () => {
    clearSaveState();
    setSaveData(loadSaveState());
    setIsPaused(false);
    showToast("PROGRESS RESET", "World journey restored to beginning.");
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#06080f]">
      {/* 1. Opening Cinematic View */}
      {viewMode === 'intro' && (
        <IntroCinematic
          onStartGame={() => setViewMode('playing')}
          onSwitchTo2D={() => setViewMode('classic_2d')}
        />
      )}

      {/* 2. 2D Classic Portfolio View (Code-split) */}
      {viewMode === 'classic_2d' && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-[#06080f] flex flex-col items-center justify-center">
            <div className="font-mono text-cyan-400 text-xs tracking-widest uppercase mb-2 animate-pulse">
              LOADING PORTFOLIO ARCHIVES...
            </div>
          </div>
        }>
          <ClassicPortfolio
            onReturnTo3D={() => setViewMode('playing')}
          />
        </Suspense>
      )}

      {/* 3. 3D Game World View */}
      {viewMode === 'playing' && (
        <>
          {/* Instant Cyber Loading Overlay during 3D initialization */}
          {isEngineLoading && (
            <div className="fixed inset-0 z-50 bg-[#06080f] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
                  INITIALIZING 3D WORLD MATRIX...
                </span>
              </div>
              <div className="w-56 h-1 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                <div className="h-full bg-cyan-400 animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {/* Three.js Canvas Container */}
          <div ref={canvasRef} className="canvas-container" />

          {/* Vignette & Scanline Overlay */}
          <div className="screen-overlay" />

          {/* Game HUD */}
          <GameHUD
            playerPos={playerPos}
            activeQuest={activeQuest}
            completedQuests={saveData.completedQuests}
            interactionPrompt={interactionPrompt}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenPauseMenu={() => setIsPaused(true)}
            onSwitchTo2D={() => setViewMode('classic_2d')}
            onTriggerInteraction={() => handleTriggerInteraction(interactionPrompt)}
          />

          {/* Mobile Touch Virtual Joystick & Buttons */}
          <MobileControls
            onJoystickMove={(vec) => {
              if (gameEngineRef.current) {
                gameEngineRef.current.player.joystickInput = vec;
              }
            }}
            onJump={() => {
              if (gameEngineRef.current) {
                gameEngineRef.current.player.handleJump();
              }
            }}
            onSprintToggle={(sprinting) => {
              if (gameEngineRef.current) {
                gameEngineRef.current.player.mobileSprint = sprinting;
              }
            }}
            onInteract={() => {
              if (interactionPrompt) {
                handleTriggerInteraction(interactionPrompt);
              }
            }}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="quest-toast glass-panel glass-panel-cyan border-cyan-400">
              <CheckCircle2 size={20} className="text-cyan-400 animate-bounce" />
              <div>
                <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  {toastMessage.title}
                </div>
                <div className="text-xs font-semibold text-white">
                  {toastMessage.subtitle}
                </div>
              </div>
            </div>
          )}

          {/* Modals wrapped in Suspense for zero-cost until opened */}
          <Suspense fallback={null}>
            {activeModal === 'dialogue' && (
              <DialogueModal
                onClose={closeActiveModal}
                onCompleteObjective={() => advanceQuest(1)}
              />
            )}

            {activeModal === 'project' && (
              <ProjectModal
                project={modalData}
                onClose={closeActiveModal}
              />
            )}

            {activeModal === 'skill' && (
              <SkillModal
                skill={modalData}
                onClose={closeActiveModal}
              />
            )}

            {activeModal === 'achievement' && (
              <AchievementModal
                achievement={modalData}
                onClose={closeActiveModal}
              />
            )}

            {activeModal === 'contact' && (
              <ContactTerminalModal
                onClose={closeActiveModal}
                onTransmissionSent={() => advanceQuest(6)}
              />
            )}

            {/* Pause Menu */}
            <PauseMenu
              isOpen={isPaused}
              onClose={() => setIsPaused(false)}
              onTeleport={handleTeleport}
              onSwitchTo2D={() => {
                setIsPaused(false);
                setViewMode('classic_2d');
              }}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onResetProgress={handleResetProgress}
            />
          </Suspense>

          {activeModal === 'easter-egg' && (
            <div className="modal-backdrop" onClick={closeActiveModal}>
              <div className="glass-panel p-6 max-w-sm text-center border-t-4 border-pink-500" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-mono font-bold text-xl">
                  👾
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-1">
                  DEV EASTER EGG FOUND
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  "Any sufficiently advanced code is indistinguishable from magic." — You unlocked the Secret Explorer badge!
                </p>
                <button onClick={closeActiveModal} className="cyber-btn cyber-btn-primary text-xs w-full">
                  COLLECT & CLOSE
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
