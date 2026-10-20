import type { ReactNode } from "react";
import type { User } from "../models/user.ts";
import DemoBanner from "./DemoBanner.tsx";
import NavBar from "./NavBar.tsx";
import UserMenu from "./UserMenu.tsx";

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: ReactNode;
}

const Layout = ({ user, onLogout, children }: LayoutProps) => (
  <>
    <header className="app-header">
      <span className="app-title">Gesta</span>
      {user && <NavBar user={user} />}
      {user && <UserMenu user={user} onLogout={onLogout} />}
    </header>
    <DemoBanner />
    <main className="app-main">{children}</main>
  </>
);

export default Layout;
