import { useState } from "react";
import DemoUserGroup from "../components/DemoUserGroup.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import { useDemoUsers } from "../hooks/useDemoUsers.ts";
import { USER_KINDS, type User, type UserKind } from "../models/user.ts";
import { USER_KIND_GROUP_LABELS } from "../utils/labels.ts";

interface LoginPageProps {
  onLogin: (kind: UserKind, id: number) => Promise<void>;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const { users, isLoading, error } = useDemoUsers();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSelect = (user: User) => {
    setLoginError(null);
    onLogin(user.kind, user.id).catch((reason: unknown) => {
      setLoginError(reason instanceof Error ? reason.message : "Connexion impossible");
    });
  };

  return (
    <section>
      <h1>Connexion de démonstration</h1>
      <p>
        Choisissez un utilisateur fictif. Il n'y a pas de mot de passe : ce mode remplace,
        en développement local uniquement, la connexion par lien envoyé par e-mail.
      </p>
      {loginError && <ErrorState message={loginError} />}
      {error && <ErrorState message={error} />}
      {isLoading && <LoadingState message="Chargement des utilisateurs…" />}
      <div className="demo-user-groups">
        {USER_KINDS.map((kind) => (
          <DemoUserGroup
            key={kind}
            title={USER_KIND_GROUP_LABELS[kind]}
            users={users.filter((user) => user.kind === kind)}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
};

export default LoginPage;
