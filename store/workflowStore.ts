import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { WorkflowState, WorkflowImage, InpaintIteration } from '../types/workflow';
import { ModelType } from '../types/models';

interface WorkflowStore {
  // State
  workflows: Record<string, WorkflowState>;
  currentWorkflowId: string | null;
  
  // Actions
  createWorkflow: (name?: string) => string;
  updateWorkflow: (id: string, updates: Partial<WorkflowState>) => void;
  deleteWorkflow: (id: string) => void;
  setCurrentWorkflow: (id: string) => void;
  
  // Workflow operations
  setWorkflowName: (id: string, name: string) => void;
  setBaseImage: (id: string, image: WorkflowImage) => void;
  addIteration: (id: string, iteration: InpaintIteration) => void;
  updateIteration: (workflowId: string, iterationId: string, updates: Partial<InpaintIteration>) => void;
  deleteIteration: (workflowId: string, iterationId: string) => void;
  setCurrentModel: (id: string, model: ModelType) => void;
  
  // Branch operations
  createBranch: (workflowId: string, name: string, fromIterationId?: string) => void;
  switchBranch: (workflowId: string, branchId: string) => void;
  
  // Checkpoint operations
  createCheckpoint: (workflowId: string, name: string) => void;
  restoreCheckpoint: (workflowId: string, checkpointId: string) => void;
  
  // Computed values
  getCurrentWorkflow: () => WorkflowState | null;
  getWorkflowById: (id: string) => WorkflowState | null;
  
  // Persistence
  clearAllWorkflows: () => void;
  exportWorkflow: (id: string) => string | null;
  importWorkflow: (data: string) => string | null;
}

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        workflows: {},
        currentWorkflowId: null,
        
        // Actions
        createWorkflow: (name = 'Untitled Workflow') => {
          const id = `workflow-${Date.now()}`;
          const newWorkflow: WorkflowState = {
            id,
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            baseImage: null,
            currentModel: undefined,
            iterations: [],
            branches: [],
            checkpoints: [],
            metadata: {}
          };
          
          set((state) => {
            state.workflows[id] = newWorkflow;
            state.currentWorkflowId = id;
          });
          
          return id;
        },
        
        updateWorkflow: (id, updates) => {
          set((state) => {
            if (state.workflows[id]) {
              state.workflows[id] = {
                ...state.workflows[id],
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
          });
        },
        
        deleteWorkflow: (id) => {
          set((state) => {
            delete state.workflows[id];
            if (state.currentWorkflowId === id) {
              state.currentWorkflowId = null;
            }
          });
        },
        
        setCurrentWorkflow: (id) => {
          set((state) => {
            if (state.workflows[id]) {
              state.currentWorkflowId = id;
            }
          });
        },
        
        // Workflow operations
        setWorkflowName: (id, name) => {
          set((state) => {
            if (state.workflows[id]) {
              state.workflows[id].name = name;
              state.workflows[id].updatedAt = new Date().toISOString();
            }
          });
        },
        
        setBaseImage: (id, image) => {
          set((state) => {
            if (state.workflows[id]) {
              state.workflows[id].baseImage = image.url;
              state.workflows[id].updatedAt = new Date().toISOString();
            }
          });
        },
        
        addIteration: (id, iteration) => {
          set((state) => {
            if (state.workflows[id]) {
              state.workflows[id].iterations.push(iteration);
              state.workflows[id].updatedAt = new Date().toISOString();
            }
          });
        },
        
        updateIteration: (workflowId, iterationId, updates) => {
          set((state) => {
            const workflow = state.workflows[workflowId];
            if (workflow) {
              const iterationIndex = workflow.iterations.findIndex((it: InpaintIteration) => it.id === iterationId);
              if (iterationIndex !== -1) {
                workflow.iterations[iterationIndex] = {
                  ...workflow.iterations[iterationIndex],
                  ...updates
                };
                workflow.updatedAt = new Date().toISOString();
              }
            }
          });
        },
        
        deleteIteration: (workflowId, iterationId) => {
          set((state) => {
            const workflow = state.workflows[workflowId];
            if (workflow) {
              workflow.iterations = workflow.iterations.filter((it: InpaintIteration) => it.id !== iterationId);
              workflow.updatedAt = new Date().toISOString();
            }
          });
        },
        
        setCurrentModel: (id, model) => {
          set((state) => {
            if (state.workflows[id]) {
              state.workflows[id].currentModel = model;
              state.workflows[id].updatedAt = new Date().toISOString();
            }
          });
        },
        
        // Branch operations
        createBranch: (workflowId, name, fromIterationId) => {
          set((state) => {
            const workflow = state.workflows[workflowId];
            if (workflow) {
              const branch = {
                id: `branch-${Date.now()}`,
                name,
                fromIterationId,
                images: [],
                createdAt: new Date().toISOString()
              };
              workflow.branches.push(branch);
              workflow.updatedAt = new Date().toISOString();
            }
          });
        },
        
        switchBranch: (workflowId, branchId) => {
          set((state) => {
            const workflow = state.workflows[workflowId];
            if (workflow) {
              workflow.metadata = {
                ...workflow.metadata,
                currentBranchId: branchId
              };
              workflow.updatedAt = new Date().toISOString();
            }
          });
        },
        
        // Checkpoint operations
        createCheckpoint: (workflowId, name) => {
          set((state) => {
            const workflow = state.workflows[workflowId];
            if (workflow) {
              const checkpoint = {
                id: `checkpoint-${Date.now()}`,
                name,
                workflowSnapshot: JSON.stringify(workflow),
                createdAt: new Date().toISOString()
              };
              workflow.checkpoints.push(checkpoint);
              workflow.updatedAt = new Date().toISOString();
            }
          });
        },
        
        restoreCheckpoint: (workflowId, checkpointId) => {
          set((state) => {
            const workflow = state.workflows[workflowId];
            if (workflow) {
              const checkpoint = workflow.checkpoints.find((cp: any) => cp.id === checkpointId);
              if (checkpoint) {
                const restoredWorkflow = JSON.parse(checkpoint.workflowSnapshot);
                state.workflows[workflowId] = {
                  ...restoredWorkflow,
                  updatedAt: new Date().toISOString()
                };
              }
            }
          });
        },
        
        // Computed values
        getCurrentWorkflow: () => {
          const state = get();
          return state.currentWorkflowId ? state.workflows[state.currentWorkflowId] : null;
        },
        
        getWorkflowById: (id) => {
          return get().workflows[id] || null;
        },
        
        // Persistence
        clearAllWorkflows: () => {
          set((state) => {
            state.workflows = {};
            state.currentWorkflowId = null;
          });
        },
        
        exportWorkflow: (id) => {
          const workflow = get().workflows[id];
          if (workflow) {
            return JSON.stringify(workflow, null, 2);
          }
          return null;
        },
        
        importWorkflow: (data) => {
          try {
            const workflow = JSON.parse(data) as WorkflowState;
            const newId = `workflow-${Date.now()}`;
            workflow.id = newId;
            workflow.updatedAt = new Date().toISOString();
            
            set((state) => {
              state.workflows[newId] = workflow;
              state.currentWorkflowId = newId;
            });
            
            return newId;
          } catch (error) {
            console.error('Failed to import workflow:', error);
            return null;
          }
        }
      })),
      {
        name: 'workflow-storage',
        partialize: (state) => ({
          workflows: state.workflows,
          currentWorkflowId: state.currentWorkflowId
        })
      }
    )
  )
);