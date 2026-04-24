import { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { ApplicantForm } from "./components/ApplicantForm";
import { ResultPanel } from "./components/ResultPanel";
import { usePrediction } from "./hooks/usePrediction";
import { getDefaultApplicant } from "./types";
import type { ApplicantData } from "./types";

/* ─── Toast Component ─────────────────────────────────── */
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm bg-danger text-white px-4 py-3 rounded-card shadow-lg
                  flex items-center gap-2 text-sm font-medium ${exiting ? "toast-exit" : "toast-enter"}`}
      role="alert"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
        <path d="M9 5V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="13" r="0.75" fill="white" />
      </svg>
      {message}
    </div>
  );
}

/* ─── Footer Component ────────────────────────────────── */
function Footer() {
  return (
    <footer className="w-full border-t border-border mt-8">
      <div className="max-w-layout mx-auto px-6 h-10 flex items-center justify-between">
        <span className="text-[11px] text-hint">
          Model: Gradient Boosting · Dataset: UCI Credit Card Applications
        </span>
        <span className="text-[11px] text-hint hidden sm:block">
          For demonstration purposes only — not financial advice
        </span>
      </div>
    </footer>
  );
}

/* ─── App ─────────────────────────────────────────────── */
export default function App() {
  const [data, setData] = useState<ApplicantData>(getDefaultApplicant);
  const { loading, result, error, predict, reset } = usePrediction();
  const [toast, setToast] = useState<string | null>(null);

  /* Show toast on error */
  useEffect(() => {
    if (error) setToast(error);
  }, [error]);

  const handleSubmit = useCallback(() => {
    predict(data);
  }, [data, predict]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Main content */}
      <main className="flex-1 w-full max-w-layout mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 fade-up">
          <h1 className="text-2xl font-bold text-heading mb-2">
            Credit Card Approval Prediction
          </h1>
          <p className="text-body text-sm max-w-2xl leading-relaxed">
            Our predictive model analyzes applicant information—such as income, employment history, and financial standing—to assess creditworthiness and predict the likelihood of credit card approval in real time.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left — Form (55%) */}
          <div className="w-full lg:w-[55%]">
            <ApplicantForm
              data={data}
              onChange={setData}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>

          {/* Right — Result Panel (45%, sticky) */}
          <div className="w-full lg:w-[45%]">
            <div className="lg:sticky lg:top-6">
              <ResultPanel
                result={result}
                loading={loading}
                data={data}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
