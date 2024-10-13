import React from "react";

interface CircularProgressProps {
  count: number; // 0 to 100
  total: number;
  size?: number; // Diameter of the circle
  strokeWidth?: number; // Thickness of the progress stroke
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  count,
  total,
  size = 100,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (count / total) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className='relative'
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        width={size}
        height={size}
        className='rotate-[-90deg]' // Rotate to start from the top
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='gray'
          strokeWidth={strokeWidth}
          fill='transparent'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='green'
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          className='transition-all duration-300'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-xl font-bold'>{count}</span>
      </div>
    </div>
  );
};

export default CircularProgress;
