---
trigger: model_decision
description: When managing global state, Zustand stores, or complex React state.
---

# State Management Rules

---

## 🧠 State Management Rules

**Use Zustand for:**
- Global application state (recipes, inventory, suppliers)
- Cross-component data sharing
- Persistent state (with localStorage middleware)

**Use React useState/useReducer for:**
- Local component state (form inputs, toggles)
- UI-only state (modals, dropdowns)

**Store Pattern:**
```typescript
interface MyStore {
  // State
  items: Item[];
  isLoading: boolean;
  
  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  items: [],
  isLoading: false,
  fetchItems: async () => {
    set({ isLoading: true });
    const items = await service.getAll();
    set({ items, isLoading: false });
  },
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

---

**Last Updated:** 2026-02-04
