import React from 'react';

const SvgNetwork = () => {
  return (
    <svg 
      className="svg-network" 
      viewBox="0 0 1000 300"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'rgba(178,197,255,0)' }}></stop>
          <stop offset="50%" style={{ stopColor: 'rgba(178,197,255,0.8)' }}></stop>
          <stop offset="100%" style={{ stopColor: 'rgba(178,197,255,0)' }}></stop>
        </linearGradient>
      </defs>
      
      {/* Animated Connection Paths */}
      <path 
        className="ai-node-line" 
        d="M100,150 Q300,50 500,150 T900,150" 
        fill="none" 
        stroke="url(#lineGrad)" 
        strokeWidth="1.5"
        style={{
          strokeDasharray: '10',
          animation: 'dash 25s linear infinite'
        }}
      />
      <path 
        className="ai-node-line" 
        d="M100,200 Q400,300 500,150 T900,100" 
        fill="none" 
        stroke="url(#lineGrad)" 
        strokeWidth="1.5" 
        style={{
          strokeDasharray: '10',
          animation: 'dash 20s linear infinite',
          animationDelay: '-5s'
        }}
      />
      <path 
        className="ai-node-line" 
        d="M150,70 Q500,30 850,220" 
        fill="none" 
        stroke="url(#lineGrad)" 
        strokeWidth="1.5" 
        style={{
          strokeDasharray: '10',
          animation: 'dash 30s linear infinite',
          animationDelay: '-12s'
        }}
      />
      
      {/* Nodes */}
      <circle cx="500" cy="150" fill="#b2c5ff" r="5"></circle>
      <circle cx="100" cy="150" fill="#b2c5ff" opacity="0.6" r="4"></circle>
      <circle cx="900" cy="150" fill="#b2c5ff" opacity="0.6" r="4"></circle>
      <circle cx="150" cy="70" fill="#b2c5ff" opacity="0.4" r="3"></circle>
      <circle cx="850" cy="220" fill="#b2c5ff" opacity="0.4" r="3"></circle>
    </svg>
  );
};

export default SvgNetwork;
