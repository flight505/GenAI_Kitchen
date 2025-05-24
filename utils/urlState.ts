/**
 * URL state management utilities
 */

import { WorkflowStep } from '../types/workflow';

export interface URLState {
  tab?: WorkflowStep;
  model?: string;
  iteration?: string;
  compare?: string;
  view?: string;
}

export const parseURLState = (searchParams: URLSearchParams): URLState => {
  return {
    tab: searchParams.get('tab') as WorkflowStep || undefined,
    model: searchParams.get('model') || undefined,
    iteration: searchParams.get('iteration') || undefined,
    compare: searchParams.get('compare') || undefined,
    view: searchParams.get('view') || undefined
  };
};

export const updateURLState = (updates: Partial<URLState>, currentUrl?: string) => {
  const url = new URL(currentUrl || window.location.href);
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return url.toString();
};

export const pushURLState = (updates: Partial<URLState>) => {
  const newUrl = updateURLState(updates);
  window.history.pushState({}, '', newUrl);
};

export const replaceURLState = (updates: Partial<URLState>) => {
  const newUrl = updateURLState(updates);
  window.history.replaceState({}, '', newUrl);
};

export const getURLStateValue = <K extends keyof URLState>(
  key: K,
  searchParams: URLSearchParams
): URLState[K] => {
  const value = searchParams.get(key);
  return value as URLState[K];
};

// Helper to create shareable URLs
export const createShareableURL = (state: URLState, baseUrl?: string): string => {
  const base = baseUrl || `${window.location.origin}/dream`;
  const url = new URL(base);
  
  Object.entries(state).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return url.toString();
};

// Helper to sync URL with workflow state
export const syncWorkflowToURL = (workflowStep: WorkflowStep, additionalParams?: Record<string, string>) => {
  const updates: URLState = { tab: workflowStep };
  
  if (additionalParams) {
    Object.assign(updates, additionalParams);
  }
  
  pushURLState(updates);
};

// Helper to get all URL parameters as an object
export const getAllURLParams = (): URLState => {
  const searchParams = new URLSearchParams(window.location.search);
  return parseURLState(searchParams);
};