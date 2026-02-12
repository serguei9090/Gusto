import { useMobileComponent } from "@/lib/mobile-registry";

// biome-ignore lint/suspicious/noExplicitAny: proxy component
export const MobileNav = (props: any) => {
  const Component = useMobileComponent("MobileNav");
  if (!Component) return null;
  return <Component {...props} />;
};
