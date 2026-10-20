import type { Company } from "../models/company.ts";
import { COMPANY_STATUS_LABELS, COMPANY_STATUS_TONES } from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface CompanyTableProps {
  companies: Company[];
}

const CompanyTable = ({ companies }: CompanyTableProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Nom</th>
          <th scope="col">Nom abrégé</th>
          <th scope="col">Localité</th>
          <th scope="col">Statut</th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company) => (
          <tr key={company.id}>
            <td>{company.name}</td>
            <td>{company.shortName}</td>
            <td>{company.locality}</td>
            <td>
              <StatusBadge
                label={COMPANY_STATUS_LABELS[company.status]}
                tone={COMPANY_STATUS_TONES[company.status]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CompanyTable;
