"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    home: "Home", internships: "Internships", dashboard: "Dashboard", profile: "Profile", signOut: "Sign Out",
    search: "Search...", allCountries: "All countries", allFields: "All fields", newest: "Newest", deadline: "Deadline", clear: "Clear", viewApply: "View / Apply", saved: "★ Saved", saveBtn: "☆ Save"
  },
  fr: {
    home: "Accueil", internships: "Stages", dashboard: "Tableau de bord", profile: "Profil", signOut: "Déconnexion",
    search: "Rechercher...", allCountries: "Tous les pays", allFields: "Tous les domaines", newest: "Plus récent", deadline: "Date limite", clear: "Effacer", viewApply: "Voir / Postuler", saved: "★ Sauvegardé", saveBtn: "☆ Sauvegarder"
  },
  ar: {
    home: "الرئيسية", internships: "التدريبات", dashboard: "لوحة التحكم", profile: "الملف الشخصي", signOut: "تسجيل الخروج",
    search: "بحث...", allCountries: "جميع البلدان", allFields: "جميع المجالات", newest: "الأحدث", deadline: "الموعد النهائي", clear: "مسح", viewApply: "عرض / تقديم", saved: "★ محفوظ", saveBtn: "☆ حفظ"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("redolution_lang") || "en";
    setLang(savedLang);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("redolution_lang", newLang);
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}