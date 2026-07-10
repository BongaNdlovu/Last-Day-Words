import type { AppNotice } from "../hooks/useNoticeQueue";
import type { ErrorTone } from "../utils/errors";

const toneClass: Record<ErrorTone, string> = {
  error: "border-rose-300 bg-rose-500/10 text-rose-200",
  warning: "border-amber-300 bg-[#f5b301]/10 text-[#fbbf24]",
  info: "border-white/10 bg-white/[0.06] text-[#c9c2b4]",
  success: "border-emerald-300 bg-emerald-500/10 text-emerald-200",
};

interface AppNoticeStackProps {
  notices: AppNotice[];
  onDismiss: (id: string) => void;
}

/** Sticky top stack for global app notices (sync, network, remote failures). */
export default function AppNoticeStack({ notices, onDismiss }: AppNoticeStackProps) {
  if (notices.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 flex flex-col gap-0" role="region" aria-label="App notifications">
      {notices.map((n) => (
        <div
          key={n.id}
          role={n.tone === "error" ? "alert" : "status"}
          aria-live={n.tone === "error" ? "assertive" : "polite"}
          className={`border-b text-xs md:text-sm px-4 py-2.5 flex items-start gap-3 justify-between ${toneClass[n.tone]}`}
        >
          <span className="leading-relaxed">{n.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(n.id)}
            className="shrink-0 font-bold uppercase tracking-wide text-[10px] px-2 py-1 rounded border border-current/20 hover:bg-black/5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
