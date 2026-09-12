import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  isHero: boolean;
  color?: string;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    
    // Mouse tracking for parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -0.5 to 0.5
      targetMouseX = (e.clientX / window.innerWidth) - 0.5;
      targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Create standard particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.5, // Slightly larger
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.8 + 0.2, // Higher base opacity
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        isHero: false
      });
    }

    // Hero particles (Cyan, Violet, Magenta)
    const heroColors = ["rgba(0,240,255,", "rgba(139,92,246,", "rgba(236,72,153,"];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.5 + 1.5,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        alpha: Math.random() * 0.6 + 0.4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.015,
        isHero: true,
        color: heroColors[i % heroColors.length]
      });
    }

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, offsetX: number, offsetY: number) => {
      const gridSize = 100;
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      
      // Calculate starting positions with parallax offset
      const startX = (offsetX % gridSize) - gridSize;
      const startY = (offsetY % gridSize) - gridSize;

      ctx.beginPath();
      for (let x = startX; x < width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = startY; y < height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    };

    const draw = () => {
      // CLEAR completely for transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly interpolate mouse position (easing)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Parallax offsets
      // Max displacement = 50px
      const pOffsetX = mouseX * -50; 
      const pOffsetY = mouseY * -50;

      // 1. Draw slow moving subtle Grid
      drawGrid(ctx, canvas.width, canvas.height, pOffsetX * 0.5, pOffsetY * 0.5);

      // 2. Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += p.pulseSpeed;
        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Apply parallax to rendering position ONLY, keep logical position (p.x, p.y) independent
        // Hero particles move slightly less to create depth
        const depthFactor = p.isHero ? 0.3 : 1.0;
        const renderX = p.x + (pOffsetX * depthFactor);
        const renderY = p.y + (pOffsetY * depthFactor);

        if (p.isHero && p.color) {
          // Draw hero glow
          const grd = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, p.r * 4);
          grd.addColorStop(0, `${p.color}${currentAlpha})`);
          grd.addColorStop(1, `${p.color}0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(renderX, renderY, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw solid core
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${currentAlpha})`;
        ctx.fill();
      }

      // 3. Draw Connecting Lines (HUD effect) for regular particles only
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].isHero) continue;
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[j].isHero) continue;

          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * 0.15; // Max 15% opacity
            const rX1 = particles[i].x + pOffsetX;
            const rY1 = particles[i].y + pOffsetY;
            const rX2 = particles[j].x + pOffsetX;
            const rY2 = particles[j].y + pOffsetY;
            
            ctx.beginPath();
            ctx.moveTo(rX1, rY1);
            ctx.lineTo(rX2, rY2);
            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
