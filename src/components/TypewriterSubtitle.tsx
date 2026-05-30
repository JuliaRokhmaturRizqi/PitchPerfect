import React, { useState, useEffect } from 'react';

interface TypewriterSubtitleProps {
  text: string;
  speed?: number; // ms per karakter
  onComplete?: () => void;
}

export const TypewriterSubtitle: React.FC<TypewriterSubtitleProps> = ({
  text,
  speed = 45, // kecepatan yang pas untuk dibaca
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIdx = 0;
    setDisplayedText('');
    setIsComplete(false);

    const intervalId = setInterval(() => {
      if (currentIdx < text.length) {
        // PERBAIKAN: Menggunakan fungsi substring() untuk memotong dari teks asli
        // Ini menjamin tidak akan ada huruf yang hilang atau terlewat akibat React StrictMode
        setDisplayedText(text.substring(0, currentIdx + 1));
        currentIdx++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return (
    <p id="landing-subtitle" className="text-[#9CA3AF] text-xs md:text-sm leading-relaxed mb-8 max-w-md min-h-[40px] md:min-h-[48px] flex items-center justify-center font-sans">
      <span>
        {displayedText}
        {!isComplete && (
          <span className="inline-block text-accent-teal font-extrabold ml-1 blink-cursor">|</span>
        )}
      </span>
    </p>
  );
};