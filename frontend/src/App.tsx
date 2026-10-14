import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-emerald-700">GreenER</CardTitle>
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
