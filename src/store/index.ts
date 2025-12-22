import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
interface SchoolYear {
  id: number;
  year: number;
  name: string;
  isActive: boolean;
}

interface GradeLevel {
  id: number;
  name: string;
  orderIndex: number;
}

interface WeightConfiguration {
  critical_constraints: number;
  high_constraints: number;
  behavioral_separation: number;
  sibling_rules: number;
  student_preferences: number;
  academic_balance: number;
  class_size_balance: number;
}

// Store interface
interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Active school year/grade
  activeSchoolYear: SchoolYear | null;
  activeGradeLevel: GradeLevel | null;
  setActiveSchoolYear: (year: SchoolYear | null) => void;
  setActiveGradeLevel: (grade: GradeLevel | null) => void;

  // Weight configuration
  weights: WeightConfiguration;
  setWeights: (weights: WeightConfiguration) => void;

  // Reset function
  reset: () => void;
}

// Default weights
const DEFAULT_WEIGHTS: WeightConfiguration = {
  critical_constraints: 1000,
  high_constraints: 500,
  behavioral_separation: 300,
  sibling_rules: 200,
  student_preferences: 100,
  academic_balance: 50,
  class_size_balance: 50,
};

// Initial state
const initialState = {
  sidebarOpen: true,
  activeSchoolYear: null,
  activeGradeLevel: null,
  weights: DEFAULT_WEIGHTS,
};

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        // Active selections
        setActiveSchoolYear: (year) =>
          set({ activeSchoolYear: year }, false, 'setActiveSchoolYear'),
        setActiveGradeLevel: (grade) =>
          set({ activeGradeLevel: grade }, false, 'setActiveGradeLevel'),

        // Configuration
        setWeights: (weights) => set({ weights }, false, 'setWeights'),

        // Reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'eloar-storage',
        partialize: (state) => ({
          activeSchoolYear: state.activeSchoolYear,
          activeGradeLevel: state.activeGradeLevel,
          weights: state.weights,
        }),
      }
    )
  )
);

export default useAppStore;
