import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.2 + 0.2,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        alpha: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.012,
      });
    }

    // A few larger "hero" stars with gold/violet tints
    for (let i = 0; i < 12; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        alpha: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      });
    }

    const heroColors = ["rgba(246,173,55,", "rgba(167,139,250,", "rgba(255,107,53,"];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width * 0.6, canvas.height);
      grad.addColorStop(0, "#0a0a12");
      grad.addColorStop(0.5, "#0d0d20");
      grad.addColorStop(1, "#12122e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle nebula blobs
      const blob1 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.2, 0,
        canvas.width * 0.8, canvas.height * 0.2, canvas.width * 0.35
      );
      blob1.addColorStop(0, "rgba(167,139,250,0.06)");
      blob1.addColorStop(1, "transparent");
      ctx.fillStyle = blob1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const blob2 = ctx.createRadialGradient(
        canvas.width * 0.1, canvas.height * 0.7, 0,
        canvas.width * 0.1, canvas.height * 0.7, canvas.width * 0.3
      );
      blob2.addColorStop(0, "rgba(246,173,55,0.04)");
      blob2.addColorStop(1, "transparent");
      ctx.fillStyle = blob2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s, i) => {
        s.pulse += s.pulseSpeed;
        const a = s.alpha * (0.7 + 0.3 * Math.sin(s.pulse));

        if (i >= 180) {
          // Hero stars with color tint
          const color = heroColors[i % heroColors.length];
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
          grd.addColorStop(0, `${color}${a})`);
          grd.addColorStop(1, `${color}0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();

        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="starfield" />;
}
