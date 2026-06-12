import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  infinite?: boolean;
  className?: string;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, infinite = false, className = '', speed = 40 }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let currentLength = 0;
    let isDeleting = false;
    let timeoutId: any;

    const tick = () => {
      if (!isDeleting) {
        if (currentLength < text.length) {
          currentLength++;
          setDisplayText(text.slice(0, currentLength));
          timeoutId = setTimeout(tick, speed);
        } else if (infinite) {
          timeoutId = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 4000); // pause at the end before deleting
        }
      } else {
        if (currentLength > 0) {
          currentLength--;
          setDisplayText(text.slice(0, currentLength));
          timeoutId = setTimeout(tick, speed / 2); // delete faster
        } else {
          isDeleting = false;
          timeoutId = setTimeout(tick, 500); // pause before re-typing
        }
      }
    };

    setDisplayText('');
    timeoutId = setTimeout(tick, speed);

    return () => clearTimeout(timeoutId);
  }, [text, infinite, speed]);

  return (
    <span className={`${className} inline-block whitespace-pre-wrap`}>
      {displayText}
      <span className="inline-block w-1 md:w-1.5 h-[1.1em] bg-accent-500 ml-1 animate-pulse align-middle -mt-1"></span>
    </span>
  );
};
