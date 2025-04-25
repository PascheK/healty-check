'use client';

import { ReactNode } from 'react';

type ModalWrapperProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalWrapper({ isOpen, isClosing, onClose, children }: ModalWrapperProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-[#2a2a3d] text-white rounded-xl p-6 w-full max-w-sm shadow-lg ${
          isClosing ? 'animate-fade-zoom-out' : 'animate-fade-zoom-in'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-xl hover:text-red-400 transition"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}
