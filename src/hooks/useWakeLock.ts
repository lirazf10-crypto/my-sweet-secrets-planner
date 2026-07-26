import { useState, useCallback, useRef, useEffect } from "react";

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        setIsActive(true);
        wakeLockRef.current.addEventListener("release", () => setIsActive(false));
      }
    } catch {
      setIsActive(false);
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isActive) release();
    else request();
  }, [isActive, request, release]);

  useEffect(() => {
    return () => { wakeLockRef.current?.release(); };
  }, []);

  return { isActive, toggle };
}
