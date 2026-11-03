import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import { useApplications } from "../hooks/useApplications.ts";
import { withdrawApplication } from "../services/applications.service.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
} from "../utils/labels.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, reload } = useApplications(token, onUnauthorized);
  const [actionError, setActionError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const handleWithdraw = async (applicationId: number) => {
    setActionError(null);
    setWithdrawingId(applicationId);
    try {
      await withdrawApplication(token, applicationId);
      reload();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Erreur inconnue");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (actionError) return <ErrorState message={actionError} />;
  if (isLoading) return <LoadingState />;

  return (
    <section>
      <h1>Mes candidatures</h1>
      <p>Suivez le statut de vos candidatures aux offres de stage.</p>
      {applications.length === 0 ? (
        <EmptyState message="Vous n'avez pas encore de candidature." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Offre</th>
                <th scope="col">Entreprise</th>
                <th scope="col">Message</th>
                <th scope="col">Statut</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.offerTitle}</td>
                  <td>{application.companyShortName}</td>
                  <td>{application.message ?? "—"}</td>
                  <td>
                    <StatusBadge
                      label={APPLICATION_STATUS_LABELS[application.status]}
                      tone={APPLICATION_STATUS_TONES[application.status]}
                    />
                  </td>
                  <td>
                    {application.status === "IN_PROGRESS" && (
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={withdrawingId === application.id}
                        onClick={() => void handleWithdraw(application.id)}
                      >
                        {withdrawingId === application.id ? "Retrait…" : "Retirer"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ApplicationsPage;
