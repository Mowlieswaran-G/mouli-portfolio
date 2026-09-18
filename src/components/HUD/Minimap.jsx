import React, { useRef, useEffect } from 'react';

const SECTORS = [
  { name: 'Spawn Hub', x: 0, z: 8, icon: '🏛️', color: '#00f0ff' },
  { name: "Creator House", x: -28, z: 0, icon: '🏠', color: '#38bdf8' },
  { name: 'Project Lab', x: 0, z: -35, icon: '💻', color: '#ff007f' },
  { name: 'Skill Arena', x: 28, z: 0, icon: '✦', color: '#10b981' },
  { name: 'Achievement Hall', x: 22, z: -28, icon: '🏆', color: '#ffb703' },
  { name: 'Core Spire', x: 0, z: -70, icon: '⚡', color: '#a855f7' },
  { name: 'Contact Station', x: 0, z: 32, icon: '🛰️', color: '#06b6d4' }
];

export const Minimap = ({ playerPos }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radarRadius = width / 2 - 8;
    const scale = 0.95; // World units to pixels

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Radar circular background
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 15, 26, 0.85)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.stroke();

    // Concentric grid circles
    [0.35, 0.7, 1.0].forEach((rFactor) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radarRadius * rFactor, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - radarRadius, centerY);
    ctx.lineTo(centerX + radarRadius, centerY);
    ctx.moveTo(centerX, centerY - radarRadius);
    ctx.lineTo(centerX, centerY + radarRadius);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.stroke();

    // Clip to circle for POIs
    ctx.clip();

    // Draw POIs relative to player position
    SECTORS.forEach((sec) => {
      const dx = (sec.x - playerPos.x) * scale;
      const dz = (sec.z - playerPos.z) * scale;
      const px = centerX + dx;
      const py = centerY + dz;

      // Distance from radar center
      const distFromCenter = Math.hypot(dx, dz);
      if (distFromCenter < radarRadius - 6) {
        // Draw POI dot
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = sec.color;
        ctx.fill();

        // Draw icon / label
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sec.icon, px, py - 6);
      }
    });

    ctx.restore();

    // Player arrow in center
    ctx.save();
    ctx.translate(centerX, centerY);
    // Rotate with player yaw
    ctx.rotate(playerPos.yaw || 0);

    // Cyan triangle pointer
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fillStyle = '#00f0ff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }, [playerPos]);

  return (
    <div className="relative group cursor-pointer" title="Radar Minimap">
      <canvas
        ref={canvasRef}
        width={140}
        height={140}
        className="rounded-full shadow-lg border border-cyan-500/20"
      />
      <div className="absolute -bottom-2 left-center translate-x-center px-2 py-0.5 bg-black/80 border border-cyan-400/40 rounded text-[9px] font-mono text-cyan-400 tracking-wider">
        MINIMAP
      </div>
    </div>
  );
};
