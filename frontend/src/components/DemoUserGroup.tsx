import type { User } from "../models/user.ts";
import { CONTACT_ROLE_LABELS, fullName } from "../utils/labels.ts";

interface DemoUserGroupProps {
  title: string;
  users: User[];
  onSelect: (user: User) => void;
}

const describeContact = (user: User): string =>
  `${user.companies.map((company) => company.shortName).join(", ")} · ${user.roles
    .map((role) => CONTACT_ROLE_LABELS[role])
    .join(", ")}`;

const DemoUserGroup = ({ title, users, onSelect }: DemoUserGroupProps) => (
  <section className="demo-user-group">
    <h2>{title}</h2>
    <ul>
      {users.map((user) => (
        <li key={`${user.kind}-${user.id}`}>
          <button type="button" className="demo-user" onClick={() => onSelect(user)}>
            <strong>{fullName(user)}</strong>
            {user.kind === "CONTACT" && <span>{describeContact(user)}</span>}
          </button>
        </li>
      ))}
    </ul>
  </section>
);

export default DemoUserGroup;
