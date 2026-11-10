import type { ReactNode } from 'react';

interface PageShellProps {
    children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
    return <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">{children}</main>;
}
