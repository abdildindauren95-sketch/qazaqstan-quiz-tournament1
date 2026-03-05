import { useEffect, useRef } from "react";

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const launch = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;

    const ps = Array.from({ length: 160 }, () => ({
      x: Math.random() * cvs.width,
      y: Math.random() * cvs.height - cvs.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: ['#f0b429', '#ffd060', '#e63b3b', '#1e6ef5', '#1db954', '#fff', '#ff69b4'][Math.floor(Math.random() * 7)],
      rot: Math.random() * 360,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      vr: (Math.random() - 0.5) * 6,
      op: 1
    }));

    let fr = 0;
    const draw = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ps.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.op;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (fr > 100) p.op -= 0.015;
      });
      fr++;
      if (ps.some(p => p.op > 0)) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
      }
    };
    draw();
  };

  return { canvasRef, launch };
}
