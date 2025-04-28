'use client';

import { useState } from 'react';

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});
  const [onCancel, setOnCancel] = useState<() => void>(() => {});

  const confirm = (opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setOnConfirm(() => () => {
        setIsOpen(false);
        resolve(true);
      });
      setOnCancel(() => () => {
        setIsOpen(false);
        resolve(false);
      });
    });
  };

  const ConfirmationModal = () => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 z-500">
        <div className="bg-foreground text-text-primary rounded-xl p-6 w-full max-w-sm shadow-lg animate-fade-zoom-in">
          <h2 className="text-xl font-bold mb-4 text-center">
            {options.title || 'Confirmation'}
          </h2>
          <p className="text-text-secondary text-center mb-6">
            {options.message || 'Es-tu sûr de vouloir effectuer cette action ?'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded hover:bg-gray-700"
            >
              {options.cancelText || 'Annuler'}
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-600 px-4 py-2 text-text-primary font-semibold rounded hover:bg-red-700"
            >
              {options.confirmText || 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmationModal };
}
