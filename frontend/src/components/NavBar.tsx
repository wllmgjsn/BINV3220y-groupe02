import { NavLink } from "react-router";
import type { User } from "../models/user.ts";
import { canListOffers } from "../utils/permissions.ts";

interface NavBarProps {
  user: User;
}

const NavBar = ({ user }: NavBarProps) => (
  <nav className="nav-bar" aria-label="Navigation principale">
    <NavLink to="/" end>
      Accueil
    </NavLink>
    {canListOffers(user) && <NavLink to="/offres">Offres</NavLink>}
    <NavLink to="/entreprises">Entreprises</NavLink>
  </nav>
);

export default NavBar;
