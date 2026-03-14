"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ScanEntry, PassPRNTResult } from "@/types";
import { openCashDrawer, printReceipt, parseCallback } from "@/lib/passprnt";

const CameraScanner = dynamic(() => import("@/components/CameraScanner"), { ssr: false });

const SAMPLE_RECEIPT_HTML = `
<html><body style="font-family:monospace;font-size:12px;width:384px;">
  <h2 style="text-align:center;">URTHE POS</h2>
  <p style="text-align:center;">--- ใบเสร็จทดสอบ ---</p>
  <p>รายการ: ทดสอบพิมพ์</p>
  <p>จำนวน: 1</p>
  <p>ราคา: 0.00 บาท</p>
  <hr/>
  <p style="text-align:center;">ขอบคุณที่ใช้บริการ</p>
</body></html>
`.trim();

export default function Home() {
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [printerStatus, setPrinterStatus] = useState<PassPRNTResult | null>(null);

  // Parse PassPRNT callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = parseCallback(params);
    if (result) {
      setPrinterStatus(result);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function handleScan(barcode: string) {
    setScanHistory((prev) => [
      { barcode, timestamp: new Date() },
      ...prev,
    ]);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        URTHE POS — Hardware Test
      </h1>

      <div className="space-y-6">
        {/* Section 1: Cash Drawer */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Cash Drawer</h2>
          <button
            onClick={() => openCashDrawer()}
            className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white active:bg-blue-700"
          >
            เปิดลิ้นชัก
          </button>

          {printerStatus && (
            <div
              className={`mt-3 rounded-lg p-3 text-sm ${
                printerStatus.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p><strong>Status:</strong> {printerStatus.success ? "สำเร็จ" : "ผิดพลาด"}</p>
              <p><strong>Code:</strong> {printerStatus.code}</p>
              {printerStatus.message && (
                <p><strong>Message:</strong> {printerStatus.message}</p>
              )}
            </div>
          )}
        </section>

        {/* Section 2: Barcode Scanner */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Barcode Scanner</h2>

          <CameraScanner onScan={handleScan} />

          {scanHistory.length > 0 && (
            <div className="mt-4">
              <div className="mb-3 rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-gray-500">ล่าสุด</p>
                <p className="text-xl font-mono font-bold text-blue-900">
                  {scanHistory[0].barcode}
                </p>
              </div>

              <h3 className="mb-2 text-sm font-medium text-gray-500">
                ประวัติ ({scanHistory.length})
              </h3>
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {scanHistory.map((entry, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span className="font-mono">{entry.barcode}</span>
                    <span className="text-xs text-gray-400">
                      {entry.timestamp.toLocaleTimeString("th-TH")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Section 3: Test Print */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Test Print</h2>
          <button
            onClick={() => printReceipt(SAMPLE_RECEIPT_HTML, true)}
            className="rounded-lg bg-green-600 px-6 py-3 text-lg font-medium text-white active:bg-green-700"
          >
            ทดสอบพิมพ์
          </button>
          <p className="mt-2 text-xs text-gray-400">พิมพ์ใบเสร็จทดสอบ + เปิดลิ้นชัก</p>
        </section>
      </div>
    </main>
  );
}
