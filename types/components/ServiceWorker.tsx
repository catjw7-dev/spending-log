"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        // 주기적 백그라운드 동기화 등록 (지원되는 경우)
        if ("periodicSync" in reg) {
          (reg as any).periodicSync.register("check-recurring", {
            minInterval: 24 * 60 * 60 * 1000, // 하루에 한 번
          }).catch(() => {});
        }
      });
    }
  }, []);

  return null;
}
