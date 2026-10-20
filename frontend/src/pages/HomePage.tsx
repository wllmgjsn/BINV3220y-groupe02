import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import { useHealth } from "../hooks/useHealth.ts";
import type { User } from "../models/user.ts";
import { profileLabel } from "../utils/labels.ts";

interface HomePageProps {
  user: User;
}

const HomePage = ({ user }: HomePageProps) => {
  const { health, error, isLoading } = useHealth();

  return (
    <section>
      <h1>Bonjour {user.firstName}</h1>
      <p>Vous êtes connecté en tant que {profileLabel(user).toLowerCase()}.</p>
      {user.companies.length > 0 && (
        <p>
          Entreprises : {user.companies.map((company) => company.shortName).join(", ")}
        </p>
      )}
      {isLoading && <LoadingState message="Connexion à l'API…" />}
      {error && <ErrorState message={`API injoignable : ${error}`} />}
      {health && <p className="state state-success">Gesta — API connectée</p>}
    </section>
  );
};

export default HomePage;
