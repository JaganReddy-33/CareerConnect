import { useEffect, useRef } from 'react';

export default function useTilt({ strength = 8, scale = 1.03, color = 'rgba(2,132,199,0.08)' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Don't enable on touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (prefersReduced || isTouch) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (y / rect.height) * -strength;
      const rotateY = (x / rect.width) * strength;
      el.style.transition = 'transform 180ms ease, box-shadow 220ms ease';
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      const shadowX = (-rotateY * 3).toFixed(1);
      const shadowY = (Math.abs(rotateX) * 3).toFixed(1);
      el.style.boxShadow = `${shadowX}px ${shadowY}px 30px ${color}, 0 8px 20px rgba(2,6,23,0.06)`;
    };

    const handleLeave = () => {
      if (ref.current) {
        ref.current.style.transition = 'transform 300ms cubic-bezier(.2,.9,.2,1), box-shadow 300ms cubic-bezier(.2,.9,.2,1)';
        ref.current.style.transform = '';
        ref.current.style.boxShadow = '';
      }
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength, scale, color]);

  return ref;
}
