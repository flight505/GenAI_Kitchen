'use client';

import { useState, useCallback, useEffect } from 'react';
import { WorkflowState, WorkflowImage, InpaintIteration } from '../types/workflow';
import { ModelType } from '../types/models';
import { saveWorkflow, loadWorkflow, clearWorkflow } from '../utils/localStorage';

interface UseWorkflowContextReturn {
  workflowState: WorkflowState | null;
  updateWorkflowName: (name: string) => void;
  setBaseImage: (image: WorkflowImage) => void;
  addIteration: (iteration: InpaintIteration) => void;
  updateCurrentModel: (model: ModelType) => void;
  addBranch: (branchName: string, fromIterationId?: string) => void;
  saveCurrentWorkflow: () => void;
  loadSavedWorkflow: (id: string) => void;
  clearCurrentWorkflow: () => void;
  updateWorkflowMetadata: (metadata: Partial<WorkflowState>) => void;
}

export function useWorkflowContext(): UseWorkflowContextReturn {
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);

  // Initialize workflow state
  useEffect(() => {
    const savedWorkflow = loadWorkflow('current');
    if (savedWorkflow) {
      setWorkflowState(savedWorkflow);
    } else {
      // Create new workflow
      const newWorkflow: WorkflowState = {
        id: `workflow-${Date.now()}`,
        name: 'Untitled Workflow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        baseImage: null,
        currentModel: undefined,
        iterations: [],
        branches: [],
        checkpoints: [],
        metadata: {}
      };
      setWorkflowState(newWorkflow);
    }
  }, []);

  // Auto-save workflow on changes
  useEffect(() => {
    if (workflowState) {
      saveWorkflow('current', workflowState);
    }
  }, [workflowState]);

  const updateWorkflowName = useCallback((name: string) => {
    setWorkflowState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const setBaseImage = useCallback((image: WorkflowImage) => {
    setWorkflowState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        baseImage: image.url,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const addIteration = useCallback((iteration: InpaintIteration) => {
    setWorkflowState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        iterations: [...prev.iterations, iteration],
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const updateCurrentModel = useCallback((model: ModelType) => {
    setWorkflowState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentModel: model,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const addBranch = useCallback((branchName: string, fromIterationId?: string) => {
    setWorkflowState(prev => {
      if (!prev) return null;
      const branch = {
        id: `branch-${Date.now()}`,
        name: branchName,
        fromIterationId,
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        branches: [...prev.branches, branch],
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const saveCurrentWorkflow = useCallback(() => {
    if (!workflowState) return;
    const id = `saved-${Date.now()}`;
    saveWorkflow(id, workflowState);
  }, [workflowState]);

  const loadSavedWorkflow = useCallback((id: string) => {
    const saved = loadWorkflow(id);
    if (saved) {
      setWorkflowState(saved);
    }
  }, []);

  const clearCurrentWorkflow = useCallback(() => {
    clearWorkflow('current');
    const newWorkflow: WorkflowState = {
      id: `workflow-${Date.now()}`,
      name: 'Untitled Workflow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      baseImage: null,
      currentModel: undefined,
      iterations: [],
      branches: [],
      checkpoints: [],
      metadata: {}
    };
    setWorkflowState(newWorkflow);
  }, []);

  const updateWorkflowMetadata = useCallback((metadata: Partial<WorkflowState>) => {
    setWorkflowState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...metadata,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  return {
    workflowState,
    updateWorkflowName,
    setBaseImage,
    addIteration,
    updateCurrentModel,
    addBranch,
    saveCurrentWorkflow,
    loadSavedWorkflow,
    clearCurrentWorkflow,
    updateWorkflowMetadata
  };
}