import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, RefreshCcw } from 'lucide-react';

/* ── Global glitch CSS ── */
const GLITCH_STYLE = `
  @keyframes crash-flicker {
    0%   { opacity: 1; }
    5%   { opacity: 0.2; }
    10%  { opacity: 1; }
    15%  { opacity: 0.5; }
    20%  { opacity: 1; }
    100% { opacity: 1; }
  }
  @keyframes crash-shake {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    10% { transform: translate(-4px, 2px) rotate(-0.3deg); }
    20% { transform: translate(4px, -2px) rotate(0.3deg); }
    30% { transform: translate(-6px, 4px) rotate(-0.5deg); }
    40% { transform: translate(6px, -4px) rotate(0.5deg); }
    50% { transform: translate(-2px, 6px) rotate(-0.2deg); }
    60% { transform: translate(2px, -6px) rotate(0.2deg); }
    70% { transform: translate(-5px, 3px) rotate(-0.4deg); }
    80% { transform: translate(5px, -3px) rotate(0.4deg); }
    90% { transform: translate(-3px, 5px) rotate(-0.3deg); }
  }
  @keyframes h-glitch {
    0%   { transform: translateX(0); clip-path: inset(0 0 100% 0); }
    5%   { clip-path: inset(10% 0 60% 0); transform: translateX(-8px); }
    10%  { clip-path: inset(50% 0 20% 0); transform: translateX(8px); }
    15%  { clip-path: inset(80% 0 5%  0); transform: translateX(-4px); }
    20%  { clip-path: inset(0 0 100% 0); transform: translateX(0); }
    100% { clip-path: inset(0 0 100% 0); transform: translateX(0); }
  }
  @keyframes rgb-split {
    0%,100% { text-shadow: 3px 0 #ff0040, -3px 0 #00cfff; }
    25%      { text-shadow: -4px 0 #ff0040, 4px 0 #00cfff; }
    50%      { text-shadow: 5px 2px #ff0040, -5px -2px #00cfff; }
    75%      { text-shadow: -2px 3px #ff0040, 2px -3px #00cfff; }
  }
  @keyframes scanline-move {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes blink-error {
    0%,49% { opacity: 1; }
    50%,100%{ opacity: 0; }
  }
  @keyframes noise-drift {
    0%   { background-position: 0 0; }
    20%  { background-position: -5% -10%; }
    40%  { background-position: 10% 5%; }
    60%  { background-position: -8% 15%; }
    80%  { background-position: 5% -8%; }
    100% { background-position: 0 0; }
  }

  /* Applied to <body> when crash is active */
  body.crash-active {
    animation: crash-shake 0.12s infinite, crash-flicker 0.8s infinite;
    filter: brightness(0.7) saturate(0.3) contrast(1.2);
  }
  /* Glitch ghost layers via ::before and ::after */
  body.crash-active::before {
    content: '';
    position: fixed;
    inset: 0;
    background: inherit;
    animation: h-glitch 0.25s infinite step-end;
    mix-blend-mode: difference;
    pointer-events: none;
    z-index: 9985;
    opacity: 0.4;
  }
`;

/* ── Noise canvas that stays semi-transparent ── */
const NoiseCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const img = ctx.createImageData(canvas.width, canvas.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const rnd = Math.random();
        if (rnd > 0.97) {
          const v = Math.floor(Math.random() * 200);
          d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = 200;
        } else if (rnd > 0.995) {
          // Color artifact
          d[i] = 255; d[i+1] = 0; d[i+2] = 60; d[i+3] = 160;
        } else {
          d[i+3] = 0;
        }
      }
      ctx.putImageData(img, 0, 0);

      // horizontal tear bars
      if (Math.random() > 0.85) {
        const y = Math.floor(Math.random() * canvas.height);
        const h = Math.floor(Math.random() * 6) + 2;
        const dx = (Math.random() - 0.5) * 60;
        ctx.save();
        ctx.drawImage(canvas, 0, y, canvas.width, h, dx, y, canvas.width, h);
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9988, pointerEvents: 'none', opacity: 0.35, mixBlendMode: 'screen' }}
    />
  );
};

/* ── Moving scanline ── */
const Scanline = () => (
  <div
    style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '4px',
      background: 'linear-gradient(transparent, rgba(255,255,255,0.06), transparent)',
      animation: 'scanline-move 2s linear infinite',
      zIndex: 9989, pointerEvents: 'none',
    }}
  />
);

/* ── Error popups scattered on screen ── */
const ErrorPopups = () => {
  const errors = [
    { top: '15%', left: '5%',  msg: 'ERR: 0x0000007E — KERNEL PANIC' },
    { top: '30%', right: '4%', msg: 'FATAL: MEMORY DUMP 0xFF3A' },
    { top: '60%', left: '3%',  msg: 'IRQL NOT LESS OR EQUAL' },
    { top: '75%', right: '6%', msg: 'STACK OVERFLOW at 0xC000021A' },
    { top: '45%', left: '50%', msg: 'SEGFAULT: NULL PTR DEREFERENCE' },
    { top: '10%', right: '20%',msg: 'DISK READ FAILURE — ABORT?' },
    { top: '85%', left: '30%', msg: 'CRITICAL_PROCESS_DIED' },
  ];

  return (
    <>
      {errors.map((e, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            top: e.top, left: e.left, right: e.right,
            zIndex: 9991,
            fontFamily: 'monospace',
            fontSize: '11px',
            color: `hsl(${Math.random() > 0.5 ? 0 : 30}, 80%, 65%)`,
            animation: `blink-error ${0.4 + Math.random() * 0.6}s ${Math.random() * 0.5}s infinite, crash-shake 0.15s infinite`,
            textShadow: '0 0 8px currentColor',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            opacity: 0.85,
            letterSpacing: '0.05em',
          }}
        >
          ▶ {e.msg}
        </div>
      ))}
    </>
  );
};

/* ── Main big error text ── */
const CrashText = () => {
  const [text, setText] = useState('SYSTEM FAILURE');
  const chars = '!@#%&*<>?\\|▓░█▄■ΧΨΩΛΣ';

  useEffect(() => {
    const base = 'SYSTEM FAILURE';
    const id = setInterval(() => {
      if (Math.random() > 0.6) {
        const scrambled = base.split('').map(c =>
          Math.random() > 0.5 ? chars[Math.floor(Math.random() * chars.length)] : c
        ).join('');
        setText(scrambled);
        setTimeout(() => setText(base), 100);
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      fontFamily: 'monospace',
      fontWeight: 900,
      fontSize: 'clamp(2rem, 6vw, 4.5rem)',
      color: '#ddd',
      letterSpacing: '0.12em',
      animation: 'rgb-split 0.15s infinite',
      zIndex: 9993,
      pointerEvents: 'none',
      textAlign: 'center',
      userSelect: 'none',
    }}>
      {text}
    </div>
  );
};

/* ── Crash overlay wrapper ── */
const CrashOverlay = ({ onRestore }) => (
  <>
    {/* Semi-transparent dark tint — web masih keliatan */}
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      zIndex: 9986, pointerEvents: 'none',
    }} />

    {/* RGB chromatic aberration overlay */}
    <div style={{
      position: 'fixed', inset: 0,
      background: 'repeating-linear-gradient(0deg, rgba(255,0,60,0.04) 0px, transparent 2px, rgba(0,200,255,0.04) 4px, transparent 6px)',
      animation: 'crash-flicker 0.3s infinite',
      zIndex: 9987, pointerEvents: 'none',
    }} />

    <NoiseCanvas />
    <Scanline />
    <ErrorPopups />
    <CrashText />

    {/* Restore button */}
    <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
      <button
        onClick={onRestore}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 28px',
          fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.2em',
          color: '#aaa',
          background: 'rgba(10,10,10,0.95)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255,0,60,0.2)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#aaa';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,60,0.2)';
        }}
      >
        <RefreshCcw style={{ width: 16, height: 16 }} />
        RESTORE SYSTEM
      </button>
    </div>
  </>
);

/* ── Root toggle component ── */
const MatrixModeToggle = () => {
  const [active, setActive] = useState(false);

  const activate = useCallback(() => {
    // Flash sequence
    document.body.style.transition = 'none';
    const flashes = [
      [0,   'brightness(3) invert(1)'],
      [80,  'brightness(0.1) saturate(0)'],
      [160, 'brightness(2) invert(1)'],
      [240, 'brightness(0.05)'],
      [320, 'brightness(0.5) saturate(0.2) contrast(1.3)'],
    ];
    flashes.forEach(([t, f]) => setTimeout(() => { document.body.style.filter = f; }, t));
    setTimeout(() => {
      document.body.style.filter = '';
      document.body.classList.add('crash-active');
      setActive(true);
    }, 400);
  }, []);

  const restore = useCallback(() => {
    document.body.classList.remove('crash-active');
    document.body.style.filter = 'brightness(1.5)';
    setTimeout(() => {
      document.body.style.filter = 'brightness(0.3)';
    }, 80);
    setTimeout(() => {
      document.body.style.filter = 'brightness(1.2)';
    }, 200);
    setTimeout(() => {
      document.body.style.filter = '';
      document.body.style.transition = '';
    }, 400);
    setActive(false);
  }, []);

  return (
    <>
      <style>{GLITCH_STYLE}</style>

      {active && <CrashOverlay onRestore={restore} />}

      {!active && (
        <button
          onClick={activate}
          title="Crash Mode"
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            zIndex: 9999,
            width: 48, height: 48, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#0a0a0a,#1c1c1c)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            cursor: 'pointer', transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.12)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255,50,50,0.4)';
            e.currentTarget.style.borderColor = 'rgba(255,50,50,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <Terminal style={{ width: 20, height: 20, color: '#888' }} />
        </button>
      )}
    </>
  );
};

export default MatrixModeToggle;
