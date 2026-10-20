import type { User } from "../models/user.ts";
import { fullName, profileLabel } from "../utils/labels.ts";

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

const UserMenu = ({ user, onLogout }: UserMenuProps) => (
  <div className="user-menu">
    <span className="user-menu-identity">
      <strong>{fullName(user)}</strong>
      <span>{profileLabel(user)}</span>
    </span>
    <button type="button" className="button button-light" onClick={onLogout}>
      Changer d'utilisateur
    </button>
  </div>
);

export default UserMenu;
