import { useSyncExternalStore } from "react";
import { createStore } from "zustand";

type MobileComponents = {
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileCard: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileCardList: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileNav: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileHeader: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileCurrencySettings: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileAbout: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileCategoryConfig: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileUnitConfig: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileInventory: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileIngredients: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileRecipes: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileSuppliers: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileDashboard: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobilePrepSheets: React.ComponentType<any>;
  // biome-ignore lint/suspicious/noExplicitAny: generic component type
  MobileCalculators: React.ComponentType<any>;
};

type MobileRegistryStore = {
  components: Partial<MobileComponents>;
  register: <K extends keyof MobileComponents>(
    name: K,
    component: MobileComponents[K],
  ) => void;
};

const store = createStore<MobileRegistryStore>((set) => ({
  components: {},
  register: (name, component) =>
    set((state) => ({
      components: { ...state.components, [name]: component },
    })),
}));

export const mobileRegistry = {
  register: store.getState().register,
};

export const useMobileComponent = <K extends keyof MobileComponents>(
  name: K,
): MobileComponents[K] | null => {
  const components = useSyncExternalStore(
    store.subscribe,
    () => store.getState().components,
  );
  return (components[name] as MobileComponents[K]) || null;
};
