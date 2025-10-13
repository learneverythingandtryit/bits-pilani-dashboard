// This file has been removed as the translation system is no longer used
// All components now use hardcoded English text

export function useLanguage() {
  throw new Error('Translation system has been removed. Components should use hardcoded English text.');
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}