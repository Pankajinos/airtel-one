import React, { useMemo } from 'react';

export default function AirtelAtmosphere() {
  // Generate a deterministic set of subtle floating binary digits (0 and 1)
  // matching the visual aesthetic of the Airtel SYNC cover page
  const binaryElements = useMemo(() => {
    const list = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      // distribute more heavily towards left & right margins like the cover page
      const side = i % 2 === 0 ? 'left' : 'right';
      const x = side === 'left' ? (i * 3.5) % 22 : 78 + ((i * 3.5) % 20);
      const y = (i * 7.5 + (i % 3) * 5) % 96;
      const isRed = i % 4 === 0 || i % 7 === 0;
      const opacity = isRed ? 0.35 + (i % 5) * 0.08 : 0.12 + (i % 4) * 0.05;
      const val = i % 2 === 0 ? '0' : '1';
      const delay = (i * 0.4) % 6;
      const duration = 7 + (i % 5) * 2;
      const size = 11 + (i % 3) * 2;

      list.push({ id: i, x, y, isRed, opacity, val, delay, duration, size });
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Deep Black Base */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Ambient Red Glow - Top Center */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #E60000 0%, #FF2020 30%, transparent 70%)'
        }}
      />

      {/* Ambient Red Glow - Bottom Right (Echoing the glowing globe aura) */}
      <div 
        className="absolute -bottom-48 -right-36 w-[800px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #E60000 0%, rgba(255, 32, 32, 0.4) 40%, transparent 75%)'
        }}
      />

      {/* Ambient Red Glow - Bottom Left Accent */}
      <div 
        className="absolute bottom-10 -left-48 w-[600px] h-[500px] rounded-full blur-[150px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #E60000 0%, transparent 70%)'
        }}
      />

      {/* Digital Network Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Thin Red Horizontal Laser Network Scan Line */}
      <div 
        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E60000]/25 to-transparent top-1/4 animate-pulse-slow"
      />

      {/* Floating Binary Digits (0 and 1) */}
      <div className="absolute inset-0 font-mono">
        {binaryElements.map((item) => (
          <span
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              color: item.isRed ? '#FF2020' : '#FFFFFF',
              opacity: item.opacity,
              fontSize: `${item.size}px`,
              animation: `float-slow ${item.duration}s ease-in-out infinite alternate`,
              animationDelay: `${item.delay}s`,
              textShadow: item.isRed ? '0 0 8px rgba(255, 32, 32, 0.7)' : 'none',
              letterSpacing: '0.1em'
            }}
          >
            {item.val}
          </span>
        ))}
      </div>
    </div>
  );
}
