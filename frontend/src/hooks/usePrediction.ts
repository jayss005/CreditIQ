import { useCallback, useState } from "react";
import type { ApplicantData, PredictionResponse, PredictionState } from "../types";

const API_URL = "http://localhost:8000";

export function usePrediction() {
  const [state, setState] = useState<PredictionState>({
    loading: false,
    result: null,
    error: null,
  });

  const predict = useCallback(async (data: ApplicantData) => {
    setState({ loading: true, result: null, error: null });

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          age_years: Number(data.age_years) || 0,
          years_employed: Number(data.years_employed) || 0,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Server error: ${response.status}`);
      }

      const result: PredictionResponse = await response.json();
      setState({ loading: false, result, error: null });
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Could not connect to prediction server"
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred";
      setState({ loading: false, result: null, error: message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, result: null, error: null });
  }, []);

  return { ...state, predict, reset };
}
