import { createContext, useContext } from 'react';
import type { Session } from '@/types/account';

interface AuthState {
    session: Session | null;
    loading: boolean;
    setSession: (session: Session | null) => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('AuthProvider ausente.');
    return context;
}

export function useAccountSession() {
    const auth = useAuth();
    if (!auth.session) throw new Error('Sessão necessária.');
    return { session: auth.session, setSession: auth.setSession };
}
