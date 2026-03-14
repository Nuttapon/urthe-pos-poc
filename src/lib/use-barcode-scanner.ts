"use client";

import { useEffect, useRef } from "react";

const SCAN_THRESHOLD_MS = 50;
const MIN_BARCODE_LENGTH = 3;

export function useBarcodeScanner(onScan: (barcode: string) => void): void {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  onScanRef.current = onScan;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const now = Date.now();

      // Reset buffer if too much time has passed since last keystroke
      if (now - lastKeyTimeRef.current > SCAN_THRESHOLD_MS) {
        bufferRef.current = "";
      }

      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (bufferRef.current.length >= MIN_BARCODE_LENGTH) {
          e.preventDefault();
          onScanRef.current(bufferRef.current);
        }
        bufferRef.current = "";
        return;
      }

      // Only buffer printable single characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        // Prevent characters from appearing in focused inputs during scan
        if (bufferRef.current.length >= MIN_BARCODE_LENGTH) {
          e.preventDefault();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);
}
