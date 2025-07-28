import { create } from 'zustand';


type MenuStore = {
    option: string | null;
    setOption: (option: string) => void;
    clearOption: () => void;
};

export const useMenuStore = create<MenuStore>((set) => ({
    option: null,
    setOption: (option) => set({ option: option }),
    clearOption: () => set({ option: null }),
}));