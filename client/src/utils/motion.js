export const cardHover = {
  y: -6,
  scale: 1.02,
  boxShadow: '0 18px 40px rgba(2,6,23,0.12)'
};

export const smallHover = {
  y: -4,
  scale: 1.01,
  boxShadow: '0 10px 25px rgba(2,6,23,0.06)'
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 }
};

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default {
  cardHover,
  smallHover,
  fadeUp,
  pageTransition
};
