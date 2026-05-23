import { create } from "zustand";

interface PortfolioState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const usePortfolio = create<PortfolioState>((set) => ({
  isLoading: true,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  theme: "light",
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));

