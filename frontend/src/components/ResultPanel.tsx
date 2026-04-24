// ResultPanel component
import type { ApplicantData, PredictionResponse } from "../types";
import { GaugeChart } from "./GaugeChart";
import { ProbBar } from "./ProbBar";
import { RiskFlags } from "./RiskFlags";

interface ResultPanelProps {
  result: PredictionResponse | null;
  loading: boolean;
  data: ApplicantData;
  onReset: () => void;
}



export function ResultPanel({ result, loading, data, onReset }: ResultPanelProps) {
  /* Empty / loading state */
  if (!result) {
    return (
      <div className="bg-white rounded-card-lg shadow-card p-6 min-h-[420px] flex flex-col items-center justify-center gap-3">
        {loading ? (
          <>
            <svg
              className="animate-spin h-12 w-12 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="31.4 31.4"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm text-body font-medium">Analysing applicant…</p>
          </>
        ) : (
          <>
            {/* Shield outline icon */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M24 4L6 12V22C6 33.1 13.66 43.32 24 46C34.34 43.32 42 33.1 42 22V12L24 4Z"
                stroke="#CBD5E1"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M18 24L22 28L30 20"
                stroke="#CBD5E1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-medium text-hint">No prediction yet</p>
            <p className="text-xs text-gray-400">
              Fill in the form and click Assess
            </p>
          </>
        )}
      </div>
    );
  }

  const approved = result.prediction === 1;

  return (
    <div className="bg-white rounded-card-lg shadow-card p-6 space-y-5 fade-up">
      {/* A) Verdict Banner */}
      <div
        className={`w-full h-12 rounded-full flex items-center justify-center text-[15px] font-semibold transition-all duration-500 ${
          approved
            ? "bg-success-bg text-success-text"
            : "bg-danger-bg text-danger-text"
        }`}
      >
        {approved ? "✓ Application Approved" : "✗ Approval Unlikely"}
      </div>

      {/* B) Gauge */}
      <GaugeChart value={result.probability_approved} approved={approved} />



      {/* D) Probability Bars */}
      <div className="space-y-3">
        <ProbBar
          label="Approval probability"
          value={result.probability_approved}
          color="#16A34A"
        />
        <ProbBar
          label="Review likelihood"
          value={result.probability_rejected}
          color="#DC2626"
        />
      </div>

      {/* E) Risk Signals */}
      <RiskFlags
        data={data}
        prediction={result.prediction}
      />

      {/* F) Recommendation Note */}
      <p className="text-[13px] text-body pt-3 border-t border-border leading-relaxed">
        {approved
          ? "Great news! Your credit card application is likely to be approved."
          : "Based on the information provided, this application is less likely to be approved at this time."}
      </p>

      {/* G) Reassess Button */}
      <button
        type="button"
        onClick={onReset}
        className="w-full h-10 rounded-input border-2 border-primary text-primary text-sm font-medium
                   hover:bg-primary hover:text-white transition-all duration-200"
        aria-label="Reassess — reset prediction"
      >
        Reassess
      </button>
    </div>
  );
}
