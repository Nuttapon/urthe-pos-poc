"use client";

import { useEffect, useRef, useState } from "react";

interface CameraScannerProps {
  onScan: (text: string) => void;
}

export default function CameraScanner({ onScan }: CameraScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  async function startScanning() {
    setError(null);
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

    const html5QrCode = new Html5Qrcode("qr-reader", {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
    });
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 300, height: 200 },
        },
        (decodedText) => {
          onScan(decodedText);
        },
        undefined
      );
      setScanning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("permission") || message.toLowerCase().includes("denied")) {
        setError("กล้องถูกปฏิเสธ — กรุณาอนุญาต Camera Permission ใน Settings แล้วโหลดหน้าใหม่");
      } else {
        setError(`ไม่สามารถเปิดกล้องได้: ${message}`);
      }
    }
  }

  async function stopScanning() {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(() => {});
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }

  return (
    <div>
      <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />

      <button
        onClick={scanning ? stopScanning : startScanning}
        className={`mt-3 rounded-lg px-6 py-3 text-lg font-medium text-white active:opacity-80 ${
          scanning ? "bg-red-600 active:bg-red-700" : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        {scanning ? "หยุดสแกน" : "เริ่มสแกน"}
      </button>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
