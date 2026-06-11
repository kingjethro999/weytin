'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCountProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCount({ end, duration = 1500, suffix = '', prefix = '' }: AnimatedCountProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Avoid running transition if end is 0
    if (end === 0) return;
    
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration]);

  // If count is 0 and we haven't run the animation, render the end to prevent visual blink
  const displayValue = count === 0 && end > 0 ? 0 : count;

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

interface LandingStatsProps {
  locationsCount: number;
  supplyCount: number;
  vendorCount: number;
  productCount: number;
}

export function LandingStats({ locationsCount, supplyCount, vendorCount, productCount }: LandingStatsProps) {
  return (
    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md">
      <div className="text-center p-4">
        <p className="text-3xl sm:text-4xl font-extrabold text-primary font-data">
          <AnimatedCount end={productCount} suffix="+" />
        </p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">Active Products</p>
      </div>
      <div className="text-center p-4 border-l border-border/40">
        <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-data">
          <AnimatedCount end={supplyCount} suffix="+" />
        </p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium font-sans">Price Reports</p>
      </div>
      <div className="text-center p-4 border-l border-border/40">
        <p className="text-3xl sm:text-4xl font-extrabold text-primary font-data">
          <AnimatedCount end={vendorCount} suffix="+" />
        </p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium font-sans">Active Users</p>
      </div>
      <div className="text-center p-4 border-l border-border/40">
        <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-data">
          <AnimatedCount end={locationsCount} suffix="+" />
        </p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium font-sans">Markets Monitored</p>
      </div>
    </div>
  );
}
