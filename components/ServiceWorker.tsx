"use client";

import { useEffect } from "react";
import { initTheme } from "@/lib/theme";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    initTheme();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        if ("periodicSync" in reg) {
          (reg as any).periodicSync.register("check-recurring", {
            minInterval: 24 * 60 * 60 * 1000,
          }).catch(() => {});
        }
      });
    }
  }, []);
  return null;
}
