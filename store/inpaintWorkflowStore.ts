import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  InpaintingWorkflowState, 
  InpaintIteration, 
  InpaintBranch,
  InpaintComparison,
  MaskToolSettings,
  InpaintingMode,
  IterationMetrics
} from '../types/inpainting';

interface InpaintWorkflowStore extends InpaintingWorkflowState {
  // Mode and session
  mode: InpaintingMode;
  sessionId: string | null;
  
  // Tool settings
  maskSettings: MaskToolSettings;
  
  // Metrics
  iterationMetrics: Map<string, IterationMetrics>;
  
  // Actions
  setBaseImage: (imageUrl: string) => void;
  lockBaseImage: (locked: boolean) => void;
  
  // Iteration management
  addIteration: (iteration: Omit<InpaintIteration, 'id' | 'timestamp'>) => string;
  updateIteration: (id: string, updates: Partial<InpaintIteration>) => void;
  setCurrentIteration: (id: string) => void;
  acceptIteration: (id: string) => void;
  rejectIteration: (id: string) => void;
  
  // Branch management
  createBranch: (name: string, fromIterationId: string) => string;
  switchBranch: (branchId: string) => void;
  mergeBranches: (branchIds: string[], strategy: 'latest' | 'best' | 'manual') => void;
  
  // Comparison management
  createComparison: (iterationIds: string[]) => void;
  deleteComparison: (comparisonId: string) => void;
  
  // Tool settings
  updateMaskSettings: (settings: Partial<MaskToolSettings>) => void;
  
  // Metrics
  addMetrics: (iterationId: string, metrics: Omit<IterationMetrics, 'iterationId'>) => void;
  
  // Session management
  startSession: (workflowId: string) => void;
  endSession: (acceptedIterationId?: string) => void;
  
  // Reset
  resetWorkflow: () => void;
}

const defaultMaskSettings: MaskToolSettings = {
  brushSize: 50,
  brushOpacity: 0.8,
  brushHardness: 0.8,
  eraseMode: false,
  showMaskOverlay: true,
  maskColor: '#ff0000',
  featherAmount: 2,
  quickSelectionMode: 'none'
};

const initialState: Omit<InpaintWorkflowStore, 'addIteration' | 'updateIteration' | 'setCurrentIteration' | 'acceptIteration' | 'rejectIteration' | 'createBranch' | 'switchBranch' | 'mergeBranches' | 'createComparison' | 'deleteComparison' | 'updateMaskSettings' | 'addMetrics' | 'startSession' | 'endSession' | 'resetWorkflow' | 'setBaseImage' | 'lockBaseImage'> = {
  baseImage: '',
  isLocked: false,
  iterations: [],
  currentIterationId: undefined,
  maxIterations: 20,
  branches: [],
  comparisons: [],
  mode: 'iterative',
  sessionId: null,
  maskSettings: defaultMaskSettings,
  iterationMetrics: new Map()
};

export const useInpaintWorkflowStore = create<InpaintWorkflowStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        setBaseImage: (imageUrl) => {
          set((state) => {
            state.baseImage = imageUrl;
            state.isLocked = false;
            state.iterations = [];
            state.branches = [];
            state.comparisons = [];
          });
        },
        
        lockBaseImage: (locked) => {
          set((state) => {
            state.isLocked = locked;
          });
        },
        
        addIteration: (iteration) => {
          const id = `iter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newIteration: InpaintIteration = {
            ...iteration,
            id,
            timestamp: Date.now()
          };
          
          set((state) => {
            state.iterations.push(newIteration);
            state.currentIterationId = id;
            
            // Auto-create branch if exceeding linear iterations
            if (iteration.parentId && state.iterations.filter((i: InpaintIteration) => i.parentId === iteration.parentId).length > 1) {
              const parentIteration = state.iterations.find((i: InpaintIteration) => i.id === iteration.parentId);
              if (parentIteration && !state.branches.some((b: InpaintBranch) => b.iterations.includes(id))) {
                const branch: InpaintBranch = {
                  id: `branch-${Date.now()}`,
                  name: `Branch from ${parentIteration.metadata.region || 'iteration'}`,
                  parentIterationId: iteration.parentId,
                  iterations: [id],
                  createdAt: Date.now()
                };
                state.branches.push(branch);
              }
            }
          });
          
          return id;
        },
        
        updateIteration: (id, updates) => {
          set((state) => {
            const iteration = state.iterations.find((i: InpaintIteration) => i.id === id);
            if (iteration) {
              Object.assign(iteration, updates);
            }
          });
        },
        
        setCurrentIteration: (id) => {
          set((state) => {
            state.currentIterationId = id;
          });
        },
        
        acceptIteration: (id) => {
          set((state) => {
            const iteration = state.iterations.find((i: InpaintIteration) => i.id === id);
            if (iteration) {
              iteration.status = 'completed';
              iteration.rating = 5;
            }
          });
        },
        
        rejectIteration: (id) => {
          set((state) => {
            const iteration = state.iterations.find((i: InpaintIteration) => i.id === id);
            if (iteration) {
              iteration.status = 'failed';
              iteration.rating = 1;
            }
          });
        },
        
        createBranch: (name, fromIterationId) => {
          const id = `branch-${Date.now()}`;
          const branch: InpaintBranch = {
            id,
            name,
            parentIterationId: fromIterationId,
            iterations: [],
            createdAt: Date.now()
          };
          
          set((state) => {
            state.branches.push(branch);
          });
          
          return id;
        },
        
        switchBranch: (branchId) => {
          const branch = get().branches.find(b => b.id === branchId);
          if (branch && branch.iterations.length > 0) {
            set((state) => {
              state.currentIterationId = branch.iterations[branch.iterations.length - 1];
            });
          }
        },
        
        mergeBranches: (branchIds, strategy) => {
          const branches = get().branches.filter(b => branchIds.includes(b.id));
          if (branches.length < 2) return;
          
          set((state) => {
            // Implement merge strategy
            if (strategy === 'latest') {
              // Keep the most recent iteration from all branches
              const allIterations = branches.flatMap((b: InpaintBranch) => b.iterations);
              const latestIteration = state.iterations
                .filter((i: InpaintIteration) => allIterations.includes(i.id))
                .sort((a: InpaintIteration, b: InpaintIteration) => b.timestamp - a.timestamp)[0];
              
              if (latestIteration) {
                state.currentIterationId = latestIteration.id;
              }
            } else if (strategy === 'best') {
              // Keep the highest rated iteration
              const allIterations = branches.flatMap((b: InpaintBranch) => b.iterations);
              const bestIteration = state.iterations
                .filter((i: InpaintIteration) => allIterations.includes(i.id) && i.rating)
                .sort((a: InpaintIteration, b: InpaintIteration) => (b.rating || 0) - (a.rating || 0))[0];
              
              if (bestIteration) {
                state.currentIterationId = bestIteration.id;
              }
            }
            
            // Remove merged branches except the first one
            const [keepBranch, ...removeBranches] = branches;
            state.branches = state.branches.filter((b: InpaintBranch) => !removeBranches.map((rb: InpaintBranch) => rb.id).includes(b.id));
          });
        },
        
        createComparison: (iterationIds) => {
          const comparison: InpaintComparison = {
            id: `comp-${Date.now()}`,
            iterationIds,
            createdAt: Date.now()
          };
          
          set((state) => {
            state.comparisons.push(comparison);
          });
        },
        
        deleteComparison: (comparisonId) => {
          set((state) => {
            state.comparisons = state.comparisons.filter((c: InpaintComparison) => c.id !== comparisonId);
          });
        },
        
        updateMaskSettings: (settings) => {
          set((state) => {
            Object.assign(state.maskSettings, settings);
          });
        },
        
        addMetrics: (iterationId, metrics) => {
          set((state) => {
            state.iterationMetrics.set(iterationId, {
              ...metrics,
              iterationId
            });
          });
        },
        
        startSession: (workflowId) => {
          set((state) => {
            state.sessionId = `session-${Date.now()}`;
            state.mode = 'iterative';
          });
        },
        
        endSession: (acceptedIterationId) => {
          set((state) => {
            state.sessionId = null;
            if (acceptedIterationId) {
              state.currentIterationId = acceptedIterationId;
            }
          });
        },
        
        resetWorkflow: () => {
          set((state) => {
            Object.assign(state, {
              ...initialState,
              iterationMetrics: new Map()
            });
          });
        }
      })),
      {
        name: 'inpaint-workflow-storage',
        partialize: (state) => ({
          baseImage: state.baseImage,
          iterations: state.iterations,
          branches: state.branches,
          maskSettings: state.maskSettings
        })
      }
    )
  )
);