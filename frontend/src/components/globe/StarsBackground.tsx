import { useEffect, useRef } from 'react';

const STAR_COUNT = 450;

export function StarsBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) return;

        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random(),
            y: Math.random(),
            radius: 0.4 + Math.random() * 1.1,
            opacity: 0.35 + Math.random() * 0.5,
        }));

        const draw = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            if (!width || !height) return;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#bae6fd';

            stars.forEach((star) => {
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalAlpha = 1;
        };

        draw();

        const observer = new ResizeObserver(draw);
        observer.observe(canvas);

        return () => observer.disconnect();
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
