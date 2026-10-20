import { useState } from "react";
import CompanyTable from "../components/CompanyTable.tsx";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import SearchField from "../components/SearchField.tsx";
import { useCompanies } from "../hooks/useCompanies.ts";

interface CompaniesPageProps {
  token: string;
  onUnauthorized: () => void;
}

const CompaniesPage = ({ token, onUnauthorized }: CompaniesPageProps) => {
  const [search, setSearch] = useState("");
  const { companies, isLoading, error } = useCompanies(token, search, onUnauthorized);

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading && companies.length === 0) return <LoadingState />;
    if (companies.length === 0) {
      return <EmptyState message="Aucune entreprise ne correspond à la recherche." />;
    }
    return (
      <>
        <p className="result-count">
          {companies.length} entreprise{companies.length > 1 ? "s" : ""}
        </p>
        <CompanyTable companies={companies} />
      </>
    );
  };

  return (
    <section>
      <h1>Entreprises</h1>
      <SearchField label="Rechercher par nom" value={search} onChange={setSearch} />
      {renderContent()}
    </section>
  );
};

export default CompaniesPage;
