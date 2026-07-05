import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div 
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
        id="toast-notification-container"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isError = toast.type === "error";
            const isSuccess = toast.type === "success";
            const isWarning = toast.type === "warning";

            let bgColor = "bg-white border-slate-100 text-slate-800 shadow-xl";
            let iconColor = "text-indigo-500";
            let Icon = Info;

            if (isError) {
              bgColor = "bg-rose-50 border-rose-150 text-rose-900 shadow-rose-100/40 shadow-xl";
              iconColor = "text-rose-600";
              Icon = AlertCircle;
            } else if (isSuccess) {
              bgColor = "bg-emerald-50 border-emerald-150 text-emerald-900 shadow-emerald-100/40 shadow-xl";
              iconColor = "text-emerald-600";
              Icon = CheckCircle;
            } else if (isWarning) {
              bgColor = "bg-amber-50 border-amber-150 text-amber-900 shadow-amber-100/40 shadow-xl";
              iconColor = "text-amber-600";
              Icon = AlertTriangle;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`p-4 rounded-2xl border flex gap-3 items-start pointer-events-auto ${bgColor}`}
                id={`toast-${toast.id}`}
              >
                <div className={`shrink-0 mt-0.5 ${iconColor}`} id={`toast-icon-${toast.id}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 text-xs font-semibold leading-relaxed" id={`toast-msg-${toast.id}`}>
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  id={`toast-close-${toast.id}`}
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
