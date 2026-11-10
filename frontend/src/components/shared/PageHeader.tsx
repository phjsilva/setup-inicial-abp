import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: ReactNode;
    description: ReactNode;
    actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {actions && <div className="max-w-full shrink-0">{actions}</div>}
        </header>
    );
}
