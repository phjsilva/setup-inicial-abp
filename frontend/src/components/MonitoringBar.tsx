import { useEffect, useState } from 'react';

export function MonitoringBar() {
  const [remaining, setRemaining] = useState(30);

  useEffect(() => {
    const timer = setInterval(
      () => setRemaining((value) => (value <= 1 ? 30 : value - 1)),
      1000,
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-4">
        <strong className="text-amber-300">SIMULADO · sem conexão à API</strong>

        <span>Próxima coleta simulada: em {remaining} s</span>

        <span>Contador demonstrativo; não altera a coleta do backend.</span>
      </div>
    </div>
  );
}
