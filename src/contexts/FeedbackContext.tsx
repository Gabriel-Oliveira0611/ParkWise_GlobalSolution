import { Check, X } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const Feedback = createContext<(mensagem: string) => void>(() => {});

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<{ mensagem: string } | null>(null);
  useEffect(() => {
    if (!aviso) return;
    const timeout = window.setTimeout(() => setAviso(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [aviso]);

  return (
    <Feedback.Provider value={(mensagem) => setAviso({ mensagem })}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]"
        role="status"
        aria-live="polite"
      >
        {aviso && (
          <div className="flex items-center gap-3 rounded-2xl bg-pine-900 px-4 py-3.5 text-sm text-white shadow-xl">
            <Check size={18} className="shrink-0 text-lime-200" />
            <span>{aviso.mensagem}</span>
            <button
              type="button"
              className="icon-button text-white"
              aria-label="Fechar aviso"
              onClick={() => setAviso(null)}
            >
              <X size={17} />
            </button>
          </div>
        )}
      </div>
    </Feedback.Provider>
  );
}

export const useFeedback = () => useContext(Feedback);
