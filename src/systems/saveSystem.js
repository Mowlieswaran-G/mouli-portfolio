// LocalStorage Save & Progress System

const SAVE_KEY = "mouli_portfolio_save_v1";

export const defaultSaveState = {
  activeQuestIndex: 0,
  completedQuests: [],
  discoveredProjects: [],
  discoveredSkills: [],
  unlockedAchievements: [],
  easterEggFound: false,
  soundMuted: false
};

export const loadSaveState = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSaveState;
    const parsed = JSON.parse(raw);
    return { ...defaultSaveState, ...parsed };
  } catch (e) {
    return defaultSaveState;
  }
};

export const persistSaveState = (state) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {}
};

export const clearSaveState = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
};
