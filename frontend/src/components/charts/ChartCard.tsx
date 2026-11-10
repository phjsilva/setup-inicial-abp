import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    contentClassName?: string;
    titleClassName?: string;
}

export function ChartCard({
    title,
    subtitle,
    children,
    contentClassName,
    titleClassName,
}: ChartCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={titleClassName}>{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent className={contentClassName}>{children}</CardContent>
        </Card>
    );
}
