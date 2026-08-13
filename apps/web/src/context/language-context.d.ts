import React from 'react';
type Language = 'ar' | 'en';
interface LanguageContextType {
    lang: Language;
    dir: 'rtl' | 'ltr';
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}
export declare function LanguageProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useLanguage(): LanguageContextType;
export {};
//# sourceMappingURL=language-context.d.ts.map