import { create } from "zustand";

interface PortfolioState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  influenceRadius: number;
  setInfluenceRadius: (radius: number) => void;
  cursorRadius: number;
  setCursorRadius: (radius: number) => void;
}

export const usePortfolio = create<PortfolioState>((set) => ({
  isLoading: true,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  theme: "light",
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  influenceRadius: 2.0,
  setInfluenceRadius: (radius: number) => set({ influenceRadius: radius }),
  cursorRadius: 120, // Default HTML cursor radius in pixels (240px diameter)
  setCursorRadius: (radius: number) => set({ cursorRadius: radius }),
}));

