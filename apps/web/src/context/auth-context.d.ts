import React from 'react';
interface AuthContextType {
    user: any;
    token: string | null;
    login: (token: string, user: any) => void;
    logout: () => void;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
//# sourceMappingURL=auth-context.d.ts.map