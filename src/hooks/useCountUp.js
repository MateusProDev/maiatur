import { useEffect, useState } from 'react';

/**
 * Hook para animar números de 0 até o valor final
 * @param {number} end - Valor final
 * @param {number} duration - Duração da animação em ms (padrão: 2000)
 * @param {number} delay - Delay antes de iniciar (padrão: 0)
 */
const useCountUp = (end, duration = 2000, delay = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < delay) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const adjustedProgress = progress - delay;
      
      if (adjustedProgress < duration) {
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - adjustedProgress / duration, 3);
        setCount(Math.floor(easeOut * end));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    if (end > 0) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, delay]);

  return count;
};

export default useCountUp;
