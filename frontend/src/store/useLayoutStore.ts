import { create } from "zustand";

interface LayoutState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  pointerStyle: string;
  setPointerStyle: (style: string) => void;
  blurAmount: number;
  setBlurAmount: (amount: number) => void;
  audioFxEnabled: boolean;
  setAudioFxEnabled: (enabled: boolean) => void;
}

// Helper to get initial value from localStorage if in browser environment
const getSafeLocal = (key: string, fallback: any) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        return stored;
      }
    }
  }
  return fallback;
};

export const useLayoutStore = create<LayoutState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  pointerStyle: getSafeLocal("cms_pointer_style", "default"),
  setPointerStyle: (style) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cms_pointer_style", style);
    }
    set({ pointerStyle: style });
  },

  blurAmount: getSafeLocal("cms_blur_amount", 12),
  setBlurAmount: (amount) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cms_blur_amount", String(amount));
      document.documentElement.style.setProperty("--glass-blur", `${amount}px`);
    }
    set({ blurAmount: amount });
  },

  audioFxEnabled: getSafeLocal("cms_audio_fx", true),
  setAudioFxEnabled: (enabled) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cms_audio_fx", String(enabled));
    }
    set({ audioFxEnabled: enabled });
  },
}));
