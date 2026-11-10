import { Route, Routes } from 'react-router';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ComparisonPage } from '@/pages/ComparisonPage';
import { RegionPage } from './pages/RegionPage';
import { RankingPage } from '@/pages/RankingPage';
import { AccessPage } from '@/pages/AccessPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { ProjectPage } from '@/pages/ProjectPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AccountGuard } from '@/components/account/AccountGuard';
import { AuthProvider } from '@/contexts/AuthProvider';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<AccessPage key="login" />} />
                <Route
                    path="/esqueci-a-senha"
                    element={<AccessPage key="forgot" flow="forgot" />}
                />
                <Route path="/redefinir-senha" element={<AccessPage key="reset" flow="reset" />} />
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route element={<AccountGuard />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/servicos/:id" element={<ServiceDetailPage />} />
                        <Route path="/comparacao" element={<ComparisonPage />} />
                        <Route path="/regioes" element={<RegionPage />} />
                        <Route path="/ranking" element={<RankingPage />} />
                        <Route path="/visao-geral" element={<OverviewPage />} />
                        <Route path="/relatorios" element={<ReportsPage />} />
                        <Route path="/perfil" element={<ProfilePage />} />
                    </Route>
                    <Route element={<AccountGuard admin />}>
                        <Route path="/configuracao" element={<ProjectPage />} />
                    </Route>
                </Route>
            </Routes>
        </AuthProvider>
    );
}
