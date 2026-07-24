import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/shared/lib/constants";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_COLLAPSED = "4rem";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    STORAGE_KEYS.SIDEBAR_COLLAPSED,
    false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const value = useMemo(
    () => ({
      collapsed: isMobile ? false : collapsed,
      setCollapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      isMobile,
    }),
    [
      collapsed,
      isMobile,
      mobileOpen,
      setCollapsed,
      toggleCollapsed,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        className="group/sidebar-wrapper flex min-h-dvh w-full"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-collapsed": SIDEBAR_WIDTH_COLLAPSED,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

export { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED };
