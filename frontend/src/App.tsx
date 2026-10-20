import { Route, Routes } from "react-router";
import ErrorState from "./components/ErrorState.tsx";
import Layout from "./components/Layout.tsx";
import LoadingState from "./components/LoadingState.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import CompaniesPage from "./pages/CompaniesPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import OffersPage from "./pages/OffersPage.tsx";
import { canListOffers } from "./utils/permissions.ts";

const App = () => {
  const auth = useAuth();

  const renderContent = () => {
    if (auth.error) return <ErrorState message={auth.error} />;
    if (auth.isLoading) return <LoadingState message="Vérification de la session…" />;
    if (auth.user === null || auth.token === null) return <LoginPage onLogin={auth.login} />;

    return (
      <Routes>
        <Route path="/" element={<HomePage user={auth.user} />} />
        {canListOffers(auth.user) && (
          <Route
            path="/offres"
            element={
              <OffersPage user={auth.user} token={auth.token} onUnauthorized={auth.logout} />
            }
          />
        )}
        <Route
          path="/entreprises"
          element={<CompaniesPage token={auth.token} onUnauthorized={auth.logout} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  };

  return (
    <Layout user={auth.user} onLogout={auth.logout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
