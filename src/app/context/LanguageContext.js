"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    home: "Home", internships: "Internships", dashboard: "Dashboard", profile: "Profile", signOut: "Sign Out",
    yourProfile: "Your Profile", desc: "Set your preferences, upload your CV, and manage email alerts.",
    save: "Save Profile", saving: "Saving...", dailyAlerts: "Daily Email Alerts", dailyDesc: "Get a daily summary of the newest internships sent to your inbox.",
    subscribe: "Subscribe", unsubscribe: "Unsubscribe", fullName: "Full Name", university: "University", major: "Major", preferredField: "Preferred Field", uploadCV: "Upload CV (PDF, max 2MB)",
    search: "Search...", allCountries: "All countries", allFields: "All fields", newest: "Newest", deadline: "Deadline", clear: "Clear", viewApply: "View / Apply", saved: "★ Saved", saveBtn: "☆ Save"
  },
  fr: {
    home: "Accueil", internships: "Stages", dashboard: "Tableau de bord", profile: "Profil", signOut: "Déconnexion",
    yourProfile: "Votre Profil", desc: "Définissez vos préférences, téléchargez votre CV et gérez les alertes.",
    save: "Enregistrer", saving: "Enregistrement...", dailyAlerts: "Alertes email", dailyDesc: "Recevez un résumé quotidien des nouveaux stages.",
    subscribe: "S'abonner", unsubscribe: "Se désabonner", fullName: "Nom complet", university: "Université", major: "Spécialité", preferredField: "Domaine préféré", uploadCV: "Télécharger le CV (PDF)",
    search: "Rechercher...", allCountries: "Tous les pays", allFields: "Tous les domaines", newest: "Plus récent", deadline: "Date limite", clear: "Effacer", viewApply: "Voir / Postuler", saved: "★ Sauvegardé", saveBtn: "☆ Sauvegarder"
  },
  ar: {
    home: "الرئيسية", internships: "التدريبات", dashboard: "لوحة التحكم", profile: "الملف الشخصي", signOut: "تسجيل الخروج",
    yourProfile: "ملفك الشخصي", desc: "قم بتعيين تفضيلاتك، وتحميل سيرتك الذاتية، وإدارة التنبيهات.",
    save: "حفظ", saving: "جاري الحفظ...", dailyAlerts: "تنبيهات البريد", dailyDesc: "احصل على ملخص يومي لأحدث التدريبات.",
    subscribe: "اشترك", unsubscribe: "إلغاء الاشتراك", fullName: "الاسم الكامل", university: "الجامعة", major: "التخصص", preferredField: "المجال المفضل", uploadCV: "تحميل السيرة الذاتية (PDF)",
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