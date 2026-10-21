import type { ChangeEvent } from "react";
import { useSearchParams } from "react-router";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import type { User } from "../models/user.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const isPeriodCode = (value: string): value is PeriodCode =>
  PERIOD_CODES.some((period) => period === value);

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = searchParams.get("period") ?? "";
  const selectedPeriod = isPeriodCode(periodParam) ? periodParam : "";
  const { offers, isLoading, error } = useOffers(
    token,
    onUnauthorized,
    selectedPeriod === "" ? undefined : selectedPeriod,
  );

  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const period = event.currentTarget.value;
    if (period !== "" && !isPeriodCode(period)) return;

    const nextSearchParams = new URLSearchParams(searchParams);
    if (period === "") {
      nextSearchParams.delete("period");
    } else {
      nextSearchParams.set("period", period);
    }
    setSearchParams(nextSearchParams);
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable offers={offers} />
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label className="search-field">
        <span>Période</span>
        <select value={selectedPeriod} onChange={handlePeriodChange}>
          <option value="">Toutes les périodes</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="OTHER">Autre</option>
        </select>
      </label>
      {renderContent()}
    </section>
  );
};

export default OffersPage;
