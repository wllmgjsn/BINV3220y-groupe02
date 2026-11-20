import { useState, type FormEvent } from "react";
import type { Application } from "../models/application.ts";
import type { Offer } from "../models/offer.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  OFFER_STATUS_LABELS,
  OFFER_STATUS_TONES,
  PERIOD_LABELS,
} from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface OfferTableProps {
  offers: Offer[];
  applicationByOffer?: ReadonlyMap<number, Application>;
  onApply?: (offerId: number, message: string) => Promise<boolean>;
}

interface ApplicationActionProps {
  offer: Offer;
  application: Application | undefined;
  onApply: (offerId: number, message: string) => Promise<boolean>;
}

const ApplicationAction = ({ offer, application, onApply }: ApplicationActionProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (application && application.status !== "WITHDRAWN") {
    return (
      <StatusBadge
        label={APPLICATION_STATUS_LABELS[application.status]}
        tone={APPLICATION_STATUS_TONES[application.status]}
      />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      if (await onApply(offer.id, message)) setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="application-form" onSubmit={(event) => void handleSubmit(event)}>
      {application && <span>Ancienne candidature retirée.</span>}
      <label className="search-field">
        <span>Message facultatif</span>
        <textarea
          aria-label={`Message facultatif pour ${offer.title}`}
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          rows={3}
        />
      </label>
      <button className="button button-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Candidater"}
      </button>
    </form>
  );
};

const OfferTable = ({ offers, applicationByOffer, onApply }: OfferTableProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Titre</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Année</th>
          <th scope="col">Période</th>
          <th scope="col">Statut</th>
          {onApply && <th scope="col">Candidature</th>}
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer.id}>
            <td>{offer.title}</td>
            <td>{offer.companyShortName}</td>
            <td>{offer.academicYear}</td>
            <td>{PERIOD_LABELS[offer.period]}</td>
            <td>
              <StatusBadge
                label={OFFER_STATUS_LABELS[offer.status]}
                tone={OFFER_STATUS_TONES[offer.status]}
              />
            </td>
            {onApply && (
              <td>
                <ApplicationAction
                  offer={offer}
                  application={applicationByOffer?.get(offer.id)}
                  onApply={onApply}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OfferTable;
