import type { ReactNode } from "react";
import { DirectionProvider } from "@/shared/components/ui/direction";
import { useLocaleStore } from "@/stores/locale.store";

export function AppProviders({ children }: { children: ReactNode }) {
  const dir = useLocaleStore((state) => state.dir);

  return (
    <DirectionProvider dir={dir} direction={dir}>
      {children}
    </DirectionProvider>
  );
}
