import { create } from "zustand";

type Section = 'landing' | 'portfolio' | 'contact';

interface ScrollSectionState {
  currentSection: Section;
  scrollToSection: (section: Section) => void;
}

export const useScrollSection = create<ScrollSectionState>((set) => ({
  currentSection: 'landing',
  scrollToSection: (section: Section) => {
    set({ currentSection: section });
  },
}));
