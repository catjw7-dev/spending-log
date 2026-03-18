export function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("theme") as "dark" | "light") ?? "light";
}

export function setTheme(theme: "dark" | "light") {
  localStorage.setItem("theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function initTheme() {
  const theme = getTheme();
  setTheme(theme);
}
