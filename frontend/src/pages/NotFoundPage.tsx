import { Link } from "react-router";

const NotFoundPage = () => (
  <section>
    <h1>Page introuvable</h1>
    <p>
      <Link to="/">Retour à l'accueil</Link>
    </p>
  </section>
);

export default NotFoundPage;
