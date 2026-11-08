import React from 'react';

interface ZeissLogoProps {
  className?: string;
  size?: number;
}

export const ZeissLogo: React.FC<ZeissLogoProps> = ({ className = '', size = 64 }) => {
  return (
    <div 
      className={`inline-block select-none overflow-hidden ${className}`} 
      style={{ width: size, height: size }}
      aria-label="ZEISS logo"
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ZEISS iconic lens-base blue shield / square shape */}
        <path
          d="M 2 2 L 98 2 L 98 86 Q 50 101 2 86 Z"
          fill="#004F9E"
        />
        {/* ZEISS wordmark */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFFFFF"
          fontFamily="'Plus Jakarta Sans', 'Arial Black', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="20.5"
          letterSpacing="0.8px"
        >
          ZEISS
        </text>
      </svg>
    </div>
  );
};
