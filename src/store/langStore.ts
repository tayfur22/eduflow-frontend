import { create } from "zustand";
import { translations, Lang, TranslationKey } from "@/lib/translations";

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  initLang: () => void;
}

export const useLangStore = create<LangStore>((set, get) => ({
  lang: "az",

  setLang: (lang) => {
    localStorage.setItem("lang", lang);
    set({ lang });
  },

  t: (key) => translations[get().lang][key] as string,

  initLang: () => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && translations[saved]) {
      set({ lang: saved });
    }
  },
}));
