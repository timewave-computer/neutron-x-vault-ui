"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastType } from "@/components";
import { v4 as uuidv4 } from "uuid";

interface ToastContextProps {
  showToast: (toast: {
    title: string;
    description?: string;
    type: ToastType;
    txUrl?: string;
    duration?: number;
  }) => void;
}

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  txUrl?: string;
  duration?: number;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (toast: {
      title: string;
      description?: string;
      type: ToastType;
      txHash?: string;
      duration?: number;
    }) => {
      const id = uuidv4();
      setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
    },
    [],
  );

  const closeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* MUST be bottom-0 right-0, otherwise the toast will not be visible */}
      <div className="fixed bottom-0 right-0 z-50 ">
        <div className="p-4 flex flex-col items-end gap-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              title={toast.title}
              description={toast.description}
              type={toast.type}
              txUrl={toast.txUrl}
              duration={toast.duration}
              onClose={closeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
