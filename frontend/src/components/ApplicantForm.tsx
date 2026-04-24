import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { FormSection } from "./FormSection";
import type { ApplicantData } from "../types";
import {
  INCOME_TYPES,
  EDUCATION_TYPES,
  FAMILY_STATUSES,
  HOUSING_TYPES,
  OCCUPATION_TYPES,
} from "../types";

/* ─── Icon helpers ────────────────────────────────────── */
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5" r="3" stroke="#1B4FD8" strokeWidth="1.5" />
      <path d="M2 14C2 11.2386 4.68629 9 8 9C11.3137 9 14 11.2386 14 14" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8L8 2L14 8" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 7V13H12V7" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="9" rx="2" stroke="#1B4FD8" strokeWidth="1.5" />
      <path d="M2 7H14" stroke="#1B4FD8" strokeWidth="1.5" />
      <circle cx="11" cy="10" r="1" fill="#1B4FD8" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="4" y="1" width="8" height="14" rx="2" stroke="#1B4FD8" strokeWidth="1.5" />
      <line x1="6" y1="12" x2="10" y2="12" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Sub-components ──────────────────────────────────── */

function SegToggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="seg-toggle" role="radiogroup" aria-label={label}>
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === i}
            data-active={String(value === i)}
            onClick={() => onChange(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function YnToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const on = value === 1;
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-body">{label}</label>
      <button
        type="button"
        className="yn-toggle"
        data-on={String(on)}
        onClick={() => onChange(on ? 0 : 1)}
        aria-label={`${label}: ${on ? "Yes" : "No"}`}
        aria-pressed={on}
      >
        <span className="label">{on ? "Yes" : "No"}</span>
        <span className="knob" />
      </button>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="stepper">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
        >
          −
        </button>
        <span className="value">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Increase ${label}`}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

function StyledSelect({
  label,
  value,
  options,
  onChange,
  id,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select
        id={id}
        className="styled-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function SearchableSelect({
  label,
  value,
  options,
  onChange,
  id,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="search-select sm:col-span-2" ref={ref}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="field-input"
        value={open ? search : value}
        placeholder="Search occupation…"
        onFocus={() => {
          setOpen(true);
          setSearch("");
        }}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
      />
      {open && (
        <div className="dropdown">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-hint">No match</div>
          )}
          {filtered.map((opt) => (
            <div
              key={opt}
              className={`dropdown-item ${opt === value ? "active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setOpen(false);
                setSearch("");
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Currency formatting ─────────────────────────────── */
function formatCurrency(val: number): string {
  return val.toLocaleString("en-IN");
}

function parseCurrency(str: string): number {
  const num = parseInt(str.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

/* ─── Main Form Component ─────────────────────────────── */

interface ApplicantFormProps {
  data: ApplicantData;
  onChange: (data: ApplicantData) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ApplicantForm({
  data,
  onChange,
  onSubmit,
  loading,
}: ApplicantFormProps) {
  const update = useCallback(
    <K extends keyof ApplicantData>(key: K, value: ApplicantData[K]) => {
      onChange({ ...data, [key]: value });
    },
    [data, onChange]
  );

  const [ageError, setAgeError] = useState("");
  const [incomeError, setIncomeError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let valid = true;

    if (Number(data.age_years) < 21 || Number(data.age_years) > 70) {
      setAgeError("Age must be between 21 and 70");
      valid = false;
    } else {
      setAgeError("");
    }

    if (data.amt_income_total < 10000) {
      setIncomeError("Income must be at least ₹10,000");
      valid = false;
    } else {
      setIncomeError("");
    }

    if (valid) onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-card shadow-card p-6 space-y-4"
    >
      <div>
        <h2 className="text-base font-semibold text-heading">
          Applicant Profile
        </h2>
        <p className="text-[13px] text-body mt-0.5">
          Fill in the applicant&apos;s details to assess credit risk.
        </p>
      </div>

      {/* Section 1 — Personal Information */}
      <FormSection title="Personal Information" icon={<PersonIcon />}>
        <SegToggle
          label="Gender"
          options={["Male", "Female"]}
          value={data.code_gender}
          onChange={(v) => update("code_gender", v)}
        />
        <div>
          <label htmlFor="age" className="field-label">
            Age
          </label>
          <div className="suffix-wrap">
            <input
              id="age"
              type="number"
              className={`field-input ${ageError ? "error" : ""}`}
              value={data.age_years}
              min={21}
              max={70}
              onChange={(e) => update("age_years", e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            />
            <span className="suffix">years</span>
          </div>
          {ageError && <p className="field-error">{ageError}</p>}
        </div>
        <StyledSelect
          label="Education level"
          value={data.name_education_type}
          options={EDUCATION_TYPES}
          onChange={(v) => update("name_education_type", v)}
          id="education"
        />
      </FormSection>

      {/* Section 2 — Family & Housing */}
      <FormSection title="Family & Housing" icon={<HomeIcon />}>
        <StyledSelect
          label="Marital status"
          value={data.name_family_status}
          options={FAMILY_STATUSES}
          onChange={(v) => update("name_family_status", v)}
          id="marital"
        />
        <Stepper
          label="No. of children"
          value={data.cnt_children}
          min={0}
          max={5}
          onChange={(v) => update("cnt_children", v)}
        />
        <Stepper
          label="Family size"
          value={data.cnt_fam_members}
          min={1}
          max={9}
          onChange={(v) => update("cnt_fam_members", v)}
        />
        <StyledSelect
          label="Housing type"
          value={data.name_housing_type}
          options={HOUSING_TYPES}
          onChange={(v) => update("name_housing_type", v)}
          id="housing"
        />
        <YnToggle
          label="Owns a car?"
          value={data.flag_own_car}
          onChange={(v) => update("flag_own_car", v)}
        />
        <YnToggle
          label="Owns property?"
          value={data.flag_own_realty}
          onChange={(v) => update("flag_own_realty", v)}
        />
      </FormSection>

      {/* Section 3 — Income & Employment */}
      <FormSection title="Income & Employment" icon={<WalletIcon />}>
        <div>
          <label htmlFor="income" className="field-label">
            Annual income
          </label>
          <div className="currency-wrap">
            <span className="prefix">₹</span>
            <input
              id="income"
              type="text"
              className={`field-input ${incomeError ? "error" : ""}`}
              value={formatCurrency(data.amt_income_total)}
              onChange={(e) =>
                update("amt_income_total", parseCurrency(e.target.value))
              }
            />
          </div>
          {incomeError && <p className="field-error">{incomeError}</p>}
        </div>
        <StyledSelect
          label="Income type"
          value={data.name_income_type}
          options={INCOME_TYPES}
          onChange={(v) => update("name_income_type", v)}
          id="income-type"
        />
        <SearchableSelect
          label="Occupation type"
          value={data.occupation_type}
          options={OCCUPATION_TYPES}
          onChange={(v) => update("occupation_type", v)}
          id="occupation"
        />
        <div>
          <label htmlFor="years-employed" className="field-label">
            Years employed
          </label>
          <div className="suffix-wrap">
            <input
              id="years-employed"
              type="number"
              step="0.5"
              min="0"
              className="field-input"
              value={data.years_employed}
              onChange={(e) =>
                update("years_employed", e.target.value === "" ? "" : parseFloat(e.target.value))
              }
            />
            <span className="suffix">yrs</span>
          </div>
          {data.years_employed === 0 && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-warning-bg text-warning-text text-[11px] font-medium">
              Unemployed
            </span>
          )}
        </div>
      </FormSection>

      {/* Section 4 — Contact & Flags */}
      <FormSection title="Contact & Flags" icon={<PhoneIcon />}>
        <YnToggle
          label="Has work phone?"
          value={data.flag_work_phone}
          onChange={(v) => update("flag_work_phone", v)}
        />
        <YnToggle
          label="Has home phone?"
          value={data.flag_phone}
          onChange={(v) => update("flag_phone", v)}
        />
        <YnToggle
          label="Has email?"
          value={data.flag_email}
          onChange={(v) => update("flag_email", v)}
        />
      </FormSection>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-input bg-primary text-white text-[15px] font-medium
                   flex items-center justify-center gap-2
                   hover:bg-blue-700 active:bg-blue-800
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-sm hover:shadow-md"
        aria-label="Assess Credit Risk"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="31.4 31.4"
                strokeLinecap="round"
              />
            </svg>
            Analysing…
          </>
        ) : (
          <>Assess Credit Risk →</>
        )}
      </button>
    </form>
  );
}
