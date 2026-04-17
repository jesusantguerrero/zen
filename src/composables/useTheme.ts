import { ref, watchEffect } from "vue";

export type Theme = "dark" | "light";
const STORAGE_KEY = "zen:theme";

const readInitial = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return "dark";
};

const theme = ref<Theme>(readInitial());

watchEffect(() => {
  const root = document.documentElement;
  if (theme.value === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme.value);
  } catch {}
});

export function useTheme() {
  const setTheme = (value: Theme) => {
    theme.value = value;
  };
  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
  };
  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
