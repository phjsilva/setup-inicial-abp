import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/contexts/auth';

export function AccountGuard({ admin = false }: { admin?: boolean }) {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading)
        return (
            <p className="mx-auto max-w-7xl p-6" role="status">
                Carregando conta…
            </p>
        );
    if (!session) {
        const from = location.pathname + location.search + location.hash;
        return <Navigate to="/login" state={{ from }} replace />;
    }
    if (admin && session.user.role !== 'admin') return <Navigate to="/visao-geral" replace />;
    return <Outlet />;
}
