import { Route, Routes } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">GreenER</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ambiente de desenvolvimento pronto.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/servicos/:id" element={<ServiceDetailPage />} />
      </Route>
    </Routes>
  );
}