const CACHE_NAME = "spending-log-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

// 백그라운드 주기적 체크
self.addEventListener("periodicsync", (e) => {
  if (e.tag === "check-recurring") {
    e.waitUntil(checkRecurring());
  }
});

self.addEventListener("push", (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? "용돈 기입장", {
      body: data.body,
      icon: "/icon-1024.png",
      badge: "/icon-1024.png",
    })
  );
});

async function checkRecurring() {
  try {
    const res = await fetch(`${self.location.origin}/api/check-recurring`);
    const { items } = await res.json();
    const today = new Date().getDate();
    items.filter((i) => i.active).forEach((item) => {
      const diff = item.day_of_month - today;
      if (diff === 0 || diff === 1) {
        const label = item.type === "expense" ? "납부일" : "입금일";
        const when = diff === 0 ? "오늘" : "내일";
        self.registration.showNotification(`${when} ${label}! 🔔`, {
          body: `${item.description} ${label}이 ${when}이에요.`,
          icon: "/icon-1024.png",
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
}
