// Header component

export function Header() {
  return (
    <header className="w-full bg-white border-b border-border">
      <div className="max-w-layout mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="28" height="28" rx="6" fill="#1B4FD8" fillOpacity="0.1" />
            <path
              d="M14 5C9.02944 5 5 9.02944 5 14C5 18.9706 9.02944 23 14 23C18.9706 23 23 18.9706 23 14C23 9.02944 18.9706 5 14 5Z"
              stroke="#1B4FD8"
              strokeWidth="1.5"
            />
            <path
              d="M14 9V14L17 17"
              stroke="#1B4FD8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 7L14 5L18 7"
              stroke="#1B4FD8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="14" r="2" fill="#1B4FD8" />
          </svg>
          <span className="text-heading font-semibold text-lg tracking-tight">
            CreditIQ
          </span>
        </div>

        {/* Tagline — desktop only */}
        <span className="hidden lg:block text-hint text-xs">
          Gradient Boosting · F1 93.41% · Recall 99.75%
        </span>
      </div>
    </header>
  );
}
