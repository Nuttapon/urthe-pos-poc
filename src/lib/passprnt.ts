import { PassPRNTResult } from "@/types";

const BACK_URL =
  typeof window !== "undefined" ? window.location.origin + "/" : "/";

export function openCashDrawer(): void {
  const params = new URLSearchParams({
    back: BACK_URL,
    drawer: "ahead",
    drawerpulse: "200",
  });

  const url = `starpassprnt://v1/print/nopreview?${params.toString()}`;

  if (typeof window !== "undefined") {
    console.log("[PassPRNT] openCashDrawer URL:", url);
    window.location.href = url;
  }
}

export function printReceipt(html: string, openDrawer = false): void {
  const params = new URLSearchParams({
    back: BACK_URL,
    html: html,
    size: "384",
    cut: "partial",
    drawer: openDrawer ? "after" : "off",
  });

  if (openDrawer) {
    params.set("drawerpulse", "200");
  }

  const url = `starpassprnt://v1/print/nopreview?${params.toString()}`;

  if (typeof window !== "undefined") {
    console.log("[PassPRNT] printReceipt URL:", url);
    window.location.href = url;
  }
}

export function parseCallback(
  searchParams: URLSearchParams
): PassPRNTResult | null {
  const codeStr = searchParams.get("passprnt_code");
  const message = searchParams.get("passprnt_message");

  if (codeStr === null) return null;

  const code = parseInt(codeStr, 10);
  return {
    success: code === 0,
    code,
    message: message ?? "",
  };
}
