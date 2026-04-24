import React, { useRef, useState, useEffect, useCallback } from "react";

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function FormSection({
  title,
  icon,
  defaultOpen = true,
  children,
}: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<string>(defaultOpen ? "2000px" : "0px");
  const [isFullyOpen, setIsFullyOpen] = useState(defaultOpen);

  const recalc = useCallback(() => {
    if (contentRef.current) {
      setMaxH(open ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setIsFullyOpen(true), 350);
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [open]);

  useEffect(() => {
    recalc();
  }, [recalc, open]);

  /* Re-measure when children change (e.g. searchable dropdown opens) */
  useEffect(() => {
    if (!open) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => {
      setMaxH(`${el.scrollHeight}px`);
    });
    observer.observe(el, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [open]);

  return (
    <div className={`border border-border rounded-card transition-shadow duration-200 hover:shadow-card ${!isFullyOpen ? 'overflow-hidden' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors duration-150"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-heading">
          {icon}
          {title}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-hint transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        ref={contentRef}
        className="accordion-content bg-white"
        style={{
          maxHeight: maxH,
          opacity: open ? 1 : 0,
          overflow: isFullyOpen ? "visible" : "hidden",
        }}
      >
        <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
