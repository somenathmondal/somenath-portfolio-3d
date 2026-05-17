import { create } from "zustand";

interface PortfolioState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const usePortfolio = create<PortfolioState>((set) => ({
  isLoading: true,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
