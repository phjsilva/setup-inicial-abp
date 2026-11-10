import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './auth';
import { fetchProfile } from '@/api/accounts';
import type { Session } from '@/types/account';

const storageKey = 'greener.session';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [initialToken] = useState(() => sessionStorage.getItem(storageKey));
    const [loading, setLoading] = useState(Boolean(initialToken));
    const [session, setCurrent] = useState<Session | null>(null);

    function setSession(value: Session | null) {
        if (value) sessionStorage.setItem(storageKey, value.token);
        else sessionStorage.removeItem(storageKey);
        setCurrent(value);
        setLoading(false);
    }

    useEffect(() => {
        function onExpired(event: Event) {
            if ((event as CustomEvent<string>).detail === sessionStorage.getItem(storageKey)) {
                setSession(null);
            }
        }
        window.addEventListener('greener:expired-session', onExpired);
        return () => window.removeEventListener('greener:expired-session', onExpired);
    }, []);

    useEffect(() => {
        if (!initialToken) return;
        const controller = new AbortController();
        fetchProfile(initialToken, controller.signal)
            .then((user) => {
                if (!controller.signal.aborted) setSession({ token: initialToken, user });
            })
            .catch(() => {
                if (!controller.signal.aborted) setSession(null);
            });
        return () => controller.abort();
    }, [initialToken]);

    return (
        <AuthContext.Provider value={{ session, loading, setSession }}>
            {children}
        </AuthContext.Provider>
    );
}
