interface Migration {
  version: number;
  migrate: (state: any) => any;
}

export const createMigration = (migrations: Migration[]) => {
  return (persistedState: any, version: number): any => {
    let state = persistedState;
    let currentVersion = version;
    
    // Sort migrations by version
    const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version);
    
    // Apply migrations sequentially
    for (const migration of sortedMigrations) {
      if (migration.version > currentVersion) {
        console.log(`Applying migration from version ${currentVersion} to ${migration.version}`);
        state = migration.migrate(state);
        currentVersion = migration.version;
      }
    }
    
    return state;
  };
};

// Example migrations for workflow store
export const workflowMigrations: Migration[] = [
  {
    version: 1,
    migrate: (state) => {
      // Example: Add default metadata to workflows
      if (state.workflows) {
        Object.values(state.workflows).forEach((workflow: any) => {
          if (!workflow.metadata) {
            workflow.metadata = {};
          }
        });
      }
      return state;
    }
  },
  {
    version: 2,
    migrate: (state) => {
      // Example: Convert old model format to new format
      if (state.workflows) {
        Object.values(state.workflows).forEach((workflow: any) => {
          if (workflow.model && typeof workflow.model === 'string') {
            workflow.currentModel = workflow.model;
            delete workflow.model;
          }
        });
      }
      return state;
    }
  }
];

// Utility to reset state if migration fails
export const safeMigrate = (
  migrate: (state: any, version: number) => any,
  resetState: () => any
) => {
  return (persistedState: any, version: number): any => {
    try {
      return migrate(persistedState, version);
    } catch (error) {
      console.error('Migration failed, resetting state:', error);
      return resetState();
    }
  };
};