import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Leaf } from 'lucide-react';

export function AccessShell({ children }: { children: ReactNode }) {
    return (
        <div className="greener-sprint min-h-screen bg-background text-foreground">
            <header className="border-b border-border">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-5">
                    <Link
                        to="/"
                        className="bg-linear-to-r from-emerald-300 to-cyan-400 bg-clip-text text-xl font-extrabold text-transparent"
                    >
                        Green<span className="font-light">ER</span>
                    </Link>
                    <Link to="/" className="gs-link">
                        Voltar ao início
                    </Link>
                </div>
            </header>
            <main className="gs-access">
                <section aria-label="Sobre o GreenER" className="gs-access-story">
                    <div className="gs-earth">
                        <img alt="" src="/textures/earth.png" />
                        <div className="gs-earth-caption">
                            <Leaf size={19} aria-hidden="true" /> Energia e emissões
                        </div>
                    </div>
                    <h2>Do consumo ao impacto ambiental</h2>
                    <p>Acompanhe energia, emissões e o status dos seus serviços em um só lugar.</p>
                </section>
                <section className="gs-card gs-access-card">{children}</section>
            </main>
        </div>
    );
}
