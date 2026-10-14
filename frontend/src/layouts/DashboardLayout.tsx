import { Link, Outlet } from 'react-router';

export function DashboardLayout() {
    return <div className="dark min-h-screen bg-background text-foreground">
        <nav className="border-b border-border p-4"><Link to="/dashboard">GreenER · Serviços</Link></nav>
        <Outlet />
    </div>;
}
