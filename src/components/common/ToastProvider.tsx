"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

type Toast = { id: number; type: "success" | "error" | "info"; message: string };

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo<ToastContextValue>(() => ({
    showSuccess: (m) => push("success", m),
    showError: (m) => push("error", m),
    showInfo: (m) => push("info", m),
  }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-sm px-4 py-3 rounded-lg shadow-md border text-sm text-white ${
              t.type === "success" ? "bg-green-600 border-green-700" : t.type === "error" ? "bg-red-600 border-red-700" : "bg-gray-800 border-gray-900"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Listen for global toast events (for places where hooks aren't available)
export const GlobalToastEvents: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent<{ type: 'success'|'error'|'info'; message: string }>;
      if (evt.detail?.type === 'success') showSuccess(evt.detail.message);
      else if (evt.detail?.type === 'error') showError(evt.detail.message);
      else if (evt.detail?.type === 'info') showInfo(evt.detail.message);
    };
    window.addEventListener('app:toast', handler as EventListener);
    return () => window.removeEventListener('app:toast', handler as EventListener);
  }, [showSuccess, showError, showInfo]);
  return null;
};


