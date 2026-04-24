// RiskFlags component
import type { ApplicantData } from "../types";

interface RiskFlagsProps {
  data: ApplicantData;
  prediction: number;
}

interface Flag {
  condition: boolean;
  label: string;
}

export function RiskFlags({ data, prediction }: RiskFlagsProps) {
  const isApproved = prediction === 1;

  const allFlags: Flag[] = isApproved
    ? [
        {
          condition: data.amt_income_total >= 80000,
          label: "Adequate income level",
        },
        {
          condition: Number(data.years_employed) >= 1,
          label: "Stable employment history",
        },
        {
          condition: data.flag_own_realty === 1,
          label: "Property ownership",
        },
        {
          condition: Number(data.age_years) >= 25,
          label: "Established credit history",
        },
        {
          condition: data.name_housing_type === "House / apartment",
          label: "Stable housing",
        },
      ]
    : [
        {
          condition: data.amt_income_total < 80000,
          label: "Income below minimum requirement",
        },
        {
          condition: Number(data.years_employed) > 0 && Number(data.years_employed) < 1,
          label: "Insufficient employment length",
        },
        {
          condition: data.cnt_children >= 3,
          label: "High number of dependents",
        },
        {
          condition: data.flag_own_realty === 0,
          label: "No property ownership",
        },
        {
          condition: data.name_housing_type === "Rented apartment",
          label: "Current housing status",
        },
        {
          condition: data.name_income_type === "Student",
          label: "Student income type",
        },
        {
          condition: Number(data.age_years) < 25,
          label: "Limited credit history",
        },
      ];

  const active = allFlags.filter((f) => f.condition).slice(0, 4);

  if (active.length === 0) {
    active.push({
      condition: true,
      label: isApproved ? "Meets general credit criteria" : "Overall application profile",
    });
  }

  const title = isApproved ? "Reasons for Approval" : "Reasons for Decision";
  const badgeClasses = isApproved
    ? "bg-green-100 text-green-800"
    : "bg-warning-bg text-warning-text";
  const icon = isApproved ? "✓" : "•";

  return (
    <div className="space-y-2 fade-up">
      <h4 className="text-[13px] font-medium text-heading">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {active.map((flag) => (
          <span
            key={flag.label}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${badgeClasses}`}
          >
            <span aria-hidden="true">{icon}</span>
            {flag.label}
          </span>
        ))}
      </div>
    </div>
  );
}
