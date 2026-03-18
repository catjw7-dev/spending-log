export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendNotification(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon-1024.png" });
  }
}

export function checkBudgetAlert(category: string, spent: number, budget: number) {
  if (budget <= 0) return;
  const pct = (spent / budget) * 100;
  if (pct >= 100) {
    sendNotification("예산 초과! 🚨", `${category} 예산을 초과했어요. (${Math.round(pct)}%)`);
  } else if (pct >= 80) {
    sendNotification("예산 주의 ⚠️", `${category} 예산의 ${Math.round(pct)}%를 사용했어요.`);
  }
}

export function checkRecurringAlerts(items: { description: string; dayOfMonth: number; type: string; active: boolean }[]) {
  const today = new Date();
  const todayDate = today.getDate();

  items.filter(i => i.active).forEach(item => {
    const diff = item.dayOfMonth - todayDate;
    if (diff === 1) {
      const label = item.type === "expense" ? "납부일" : "입금일";
      sendNotification(`내일 ${label}! 📅`, `${item.description} ${label}이 내일이에요.`);
    } else if (diff === 0) {
      const label = item.type === "expense" ? "납부일" : "입금일";
      sendNotification(`오늘 ${label}! 🔔`, `${item.description} ${label}이 오늘이에요.`);
    }
  });
}
