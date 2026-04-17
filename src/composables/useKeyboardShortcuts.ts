import { ref } from "vue";

const isOpen = ref(false);

export interface Shortcut {
  keys: string;
  description: string;
  scope?: string;
}

export const SHORTCUTS: Shortcut[] = [
  { keys: "Cmd / Ctrl + K", description: "Open command palette", scope: "Global" },
  { keys: "Shift + K", description: "Open quick add", scope: "Zenboard" },
  { keys: "Shift + F", description: "Toggle focus mode", scope: "Zenboard" },
  { keys: "Ctrl + Enter", description: "Save task (in task form)", scope: "Task" },
  { keys: "Esc", description: "Close modal / exit focus mode", scope: "Global" },
  { keys: "?", description: "Open this shortcuts panel", scope: "Global" },
];

export function useKeyboardShortcuts() {
  const openShortcutsPanel = () => {
    isOpen.value = true;
  };
  const closeShortcutsPanel = () => {
    isOpen.value = false;
  };
  const toggleShortcutsPanel = () => {
    isOpen.value = !isOpen.value;
  };
  return {
    isOpen,
    openShortcutsPanel,
    closeShortcutsPanel,
    toggleShortcutsPanel,
  };
}
