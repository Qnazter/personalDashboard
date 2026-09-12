"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export function Globe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let phi = 0;
    let width = 0;
    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 2.8,
      baseColor: [0.14, 0.24, 0.39],
      markerColor: [0.38, 0.65, 0.98],
      glowColor: [0.08, 0.15, 0.25],
      markers: [
        { location: [13.7563, 100.5018], size: 0.08 },
        { location: [35.6762, 139.6503], size: 0.06 },
        { location: [1.3521, 103.8198], size: 0.05 },
        { location: [51.5072, -0.1276], size: 0.04 },
      ],
    });
    const resize = () => { width = canvasRef.current?.offsetWidth ?? 0; };
    resize(); window.addEventListener("resize", resize);
    let frame = 0;
    const rotate = () => { globe.update({ phi, width: width * 2, height: width * 2 }); phi += 0.003; frame = requestAnimationFrame(rotate); };
    rotate();
    return () => { cancelAnimationFrame(frame); globe.destroy(); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className={`absolute aspect-square w-[135%] max-w-none ${className}`} />;
}
