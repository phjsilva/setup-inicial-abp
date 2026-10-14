import { House, Server } from 'lucide-react';
import { MonitoringBar } from '@/components/MonitoringBar';
import { NavLink, Outlet, useLocation } from 'react-router';

const navItems = [
    { to: '/', label: 'Início', icon: House, prefixes: [] as string[] },
    {
        to: '/dashboard',
        label: 'Serviços',
        icon: Server,
        prefixes: ['/dashboard', '/servicos'],
    },
];

const linkClass =
    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors';
const activeClass = 'border-emerald-400/45 bg-emerald-400/10 text-foreground';
const idleClass = 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground';

export function DashboardLayout() {
    const { pathname } = useLocation();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
                    <NavLink
                        to="/"
                        className="bg-linear-to-r from-emerald-300 to-cyan-400 bg-clip-text text-xl font-extrabold text-transparent"
                    >
                        Green<span className="font-light">ER</span>
                    </NavLink>
                    <nav aria-label="Seções do dashboard" className="flex gap-1 overflow-x-auto">
                        {navItems.map(({ to, label, icon: Icon, prefixes }) => {
                            const isActive =
                                pathname === to ||
                                prefixes.some((prefix) => pathname.startsWith(prefix));

                            return (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={`${linkClass} ${isActive ? activeClass : idleClass}`}
                                >
                                    <Icon aria-hidden="true" className="size-4" />
                                    {label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </header>
            <MonitoringBar />

            <div className="flex-1">
                <Outlet />
            </div>

            <footer className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
                <p className="mx-auto max-w-7xl">
                    Os valores apresentados são estimativas calculadas a partir das métricas
                    disponíveis e de fatores regionais de emissão. Eles não representam uma medição
                    elétrica direta.
                </p>
            </footer>
        </div>
    );
}
