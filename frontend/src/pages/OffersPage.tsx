import type { ChangeEvent } from "react";
import { useSearchParams } from "react-router";
import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useApplications } from "../hooks/useApplications.ts";
import { useOffers } from "../hooks/useOffers.ts";
import type { Application } from "../models/application.ts";
import { PERIOD_CODES, type Offer, type PeriodCode } from "../models/offer.ts";
import type { User } from "../models/user.ts";
import { applyToOffer } from "../services/applications.service.ts";
import { removeOffer } from "../services/offers.service.ts";
import { isUnauthorized } from "../utils/api.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées. Candidatez directement depuis la liste.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const isPeriodCode = (value: string): value is PeriodCode =>
  PERIOD_CODES.some((period) => period === value);

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = searchParams.get("period") ?? "";
  const selectedPeriod = isPeriodCode(periodParam) ? periodParam : "";
  const search = searchParams.get("q") ?? "";
  const { offers, isLoading, error, reload: reloadOffers } = useOffers(
    token,
    onUnauthorized,
    selectedPeriod === "" ? undefined : selectedPeriod,
    search === "" ? undefined : search,
  );
  const isStudent = user.kind === "STUDENT";
  const canRemoveOffers = user.kind === "ADMIN" ||
    (user.kind === "CONTACT" && user.roles.includes("DEPOSITOR"));
  const applicationState = useApplications(token, onUnauthorized, isStudent);
  const applicationByOffer = new Map<number, Application>();
  for (const application of applicationState.applications) {
    if (!applicationByOffer.has(application.offerId)) {
      applicationByOffer.set(application.offerId, application);
    }
  }

  const handleApply = async (offerId: number, message: string): Promise<boolean> => {
    setActionError(null);
    try {
      await applyToOffer(token, offerId, message);
      applicationState.reload();
      return true;
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Erreur inconnue");
      return false;
    }
  };

  const handleRemove = async (offerId: number): Promise<boolean> => {
    setActionError(null);
    try {
      await removeOffer(token, offerId);
      reloadOffers();
      return true;
    } catch (reason) {
      if (isUnauthorized(reason)) {
        onUnauthorized();
        return false;
      }
      setActionError(reason instanceof Error ? reason.message : "Erreur inconnue");
      return false;
    }
  };

  const canRemoveOffer = (offer: Offer): boolean =>
    user.kind === "ADMIN" || offer.status === "SUBMITTED" || offer.status === "PENDING";

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

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    const nextSearch = event.currentTarget.value.trim();
    if (nextSearch === "") {
      nextSearchParams.delete("q");
    } else {
      nextSearchParams.set("q", nextSearch);
    }
    setSearchParams(nextSearchParams);
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (applicationState.error) return <ErrorState message={applicationState.error} />;
    if (isLoading || applicationState.isLoading) return <LoadingState />;
    if (offers.length === 0) {
      return (
        <EmptyState
          message={search === "" ? "Aucune offre à afficher." : "Aucune offre ne correspond à la recherche."}
        />
      );
    }
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          applicationByOffer={isStudent ? applicationByOffer : undefined}
          onApply={isStudent ? handleApply : undefined}
          onRemove={canRemoveOffers ? handleRemove : undefined}
          removeLabel={user.kind === "ADMIN" ? "Supprimer" : "Retirer"}
          isRemovable={canRemoveOffers ? canRemoveOffer : undefined}
        />
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label className="search-field">
        <span>Rechercher par titre</span>
        <input type="text" value={search} onChange={handleSearchChange} />
      </label>
      <label className="search-field">
        <span>Période</span>
        <select value={selectedPeriod} onChange={handlePeriodChange}>
          <option value="">Toutes les périodes</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="OTHER">Autre</option>
        </select>
      </label>
      {actionError && <ErrorState message={actionError} />}
      {renderContent()}
    </section>
  );
};

export default OffersPage;
