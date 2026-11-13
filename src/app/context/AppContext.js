"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

const translations = {
  en: {
    home: "Home",
    internships: "Internships",
    dashboard: "Dashboard",
    profile: "Profile",
    signOut: "Sign Out",
    favorites: "Favorites",
    darkMode: "Dark Mode",
    language: "Language",
    yourFavorites: "Your Favorite Offers",
    noFavorites: "You haven't saved any favorites yet.",
    apply: "View / Apply",
    track: "Track",
    save: "Save",
    saved: "Saved",
  },
  fr: {
    home: "Accueil",
    internships: "Stages",
    dashboard: "Tableau de bord",
    profile: "Profil",
    signOut: "Déconnexion",
    favorites: "Favoris",
    darkMode: "Mode Sombre",
    language: "Langue",
    yourFavorites: "Vos offres favorites",
    noFavorites: "Vous n'avez pas encore sauvegardé de favoris.",
    apply: "Voir / Postuler",
    track: "Suivre",
    save: "Sauver",
    saved: "Sauvegardé",
  },
  ar: {
    home: "الرئيسية",
    internships: "التدريبات",
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    signOut: "تسجيل الخروج",
    favorites: "المفضلة",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    yourFavorites: "عروضك المفضلة",
    noFavorites: "لم تقم بحفظ أي عروض مفضلة بعد.",
    apply: "عرض / تقديم",
    track: "تتبع",
    save: "حفظ",
    saved: "محفوظ",
  }
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("en");

  // Load preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("redolution_theme") || "light";
    const savedLang = localStorage.getItem("redolution_lang") || "en";
    setTheme(savedTheme);
    setLang(savedLang);
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("redolution_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("redolution_lang", newLang);
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, changeLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}