import { useEffect, useRef } from 'react';

export default function MathCurveLoader() {
    const groupRef = useRef<SVGGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const particlesRef = useRef<SVGCircleElement[]>([]);

    const config = {
        name: "Original Thinking",
        tag: "Custom Rose Trail",
        rotate: true,
        particleCount: 64,
        trailSpan: 0.38,
        durationMs: 4600,
        rotationDurationMs: 28000,
        pulseDurationMs: 4200,
        strokeWidth: 5.5,
        baseRadius: 7,
        detailAmplitude: 3,
        petalCount: 7,
        curveScale: 3.9,
        point(progress: number, detailScale: number, config: any) {
            const t = progress * Math.PI * 2;
            const petals = Math.round(config.petalCount);
            const x = config.baseRadius * Math.cos(t) - config.detailAmplitude * detailScale * Math.cos(petals * t);
            const y = config.baseRadius * Math.sin(t) - config.detailAmplitude * detailScale * Math.sin(petals * t);
            return {
                x: 50 + x * config.curveScale,
                y: 50 + y * config.curveScale,
            };
        },
    };

    useEffect(() => {
        if (!groupRef.current || !pathRef.current) return;

        const SVG_NS = 'http://www.w3.org/2000/svg';
        const group = groupRef.current;
        const path = pathRef.current;
        
        path.setAttribute('stroke-width', String(config.strokeWidth));
        
        // Create particles if not already created
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < config.particleCount; i++) {
                const circle = document.createElementNS(SVG_NS, 'circle');
                circle.setAttribute('fill', 'currentColor');
                group.appendChild(circle);
                particlesRef.current.push(circle);
            }
        }

        function normalizeProgress(progress: number) {
            return ((progress % 1) + 1) % 1;
        }

        function getDetailScale(time: number) {
            const pulseProgress = (time % config.pulseDurationMs) / config.pulseDurationMs;
            const pulseAngle = pulseProgress * Math.PI * 2;
            return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
        }

        function getRotation(time: number) {
            if (!config.rotate) return 0;
            return -((time % config.rotationDurationMs) / config.rotationDurationMs) * 360;
        }

        function buildPath(detailScale: number, steps = 480) {
            return Array.from({ length: steps + 1 }, (_, index) => {
                const point = config.point(index / steps, detailScale, config);
                return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
            }).join(' ');
        }

        function getParticle(index: number, progress: number, detailScale: number) {
            const tailOffset = index / (config.particleCount - 1);
            const point = config.point(normalizeProgress(progress - tailOffset * config.trailSpan), detailScale, config);
            const fade = Math.pow(1 - tailOffset, 0.56);
            return {
                x: point.x,
                y: point.y,
                radius: 0.9 + fade * 2.7,
                opacity: 0.04 + fade * 0.96,
            };
        }

        const startedAt = performance.now();
        let animationFrame: number;

        function render(now: number) {
            const time = now - startedAt;
            const progress = (time % config.durationMs) / config.durationMs;
            const detailScale = getDetailScale(time);

            if (group) group.setAttribute('transform', `rotate(${getRotation(time)} 50 50)`);
            if (path) path.setAttribute('d', buildPath(detailScale));

            particlesRef.current.forEach((node, index) => {
                const particle = getParticle(index, progress, detailScale);
                node.setAttribute('cx', particle.x.toFixed(2));
                node.setAttribute('cy', particle.y.toFixed(2));
                node.setAttribute('r', particle.radius.toFixed(2));
                node.setAttribute('opacity', particle.opacity.toFixed(3));
            });

            animationFrame = requestAnimationFrame(render);
        }

        animationFrame = requestAnimationFrame(render);

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div className="math-curve-loader-container" style={{ width: '120px', height: '120px', color: '#F59E0B' }}>
            <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <g ref={groupRef} style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' }}>
                    <path ref={pathRef} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" opacity="0.03" />
                </g>
            </svg>
        </div>
    );
}
