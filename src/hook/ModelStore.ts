import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'

type ModelStore = {
  models: Record<string, string[]>;
  root: any;
  addModel: (key: string, workplanes: string[]) => void;
  removeModel: (key: string) => void;
  setRoot: (root: any) => void;
  clearModels: () => void;
};

export const useModelStore = create<ModelStore>()(
  subscribeWithSelector((set, get) => ({
    root: null,
    models: {},
    setRoot: (R: any) => {
      set({ root: R });
    },
    addModel: (key: string, workplanes: string[]) => {
      const { models } = get();
      const newModels = { ...models, [key]: workplanes };
      set({ models: newModels });
    },
    removeModel: (key: string) => {
      const { models } = get();
      const newModels = { ...models };
      delete newModels[key];
      set({ models: newModels });
    },
    clearModels: () => set({ models: {} }),
  }))
);