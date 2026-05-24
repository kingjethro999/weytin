'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const thresholdValue = Array.isArray(threshold) ? threshold.join(',') : threshold;

  const frozen = isVisible && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
      setIsVisible(entry.isIntersecting);
    }, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [root, rootMargin, threshold, thresholdValue, frozen]);

  return { elementRef, entry, isVisible };
}
