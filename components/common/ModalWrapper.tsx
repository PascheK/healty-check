'use client';

import { ReactNode } from 'react';

type ModalWrapperProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalWrapper({ isOpen, isClosing, onClose, children }: ModalWrapperProps) {
  // 🔵 Si le modal n'est pas ouvert, ne rien rendre
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
    >
      {/* Conteneur du modal */}
      <div
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture du modal lorsqu'on clique à l'intérieur
        className={`relative bg-foreground text-text-primary rounded-xl p-6 w-full max-w-sm shadow-lg ${
          isClosing ? 'animate-fade-zoom-out' : 'animate-fade-zoom-in'
        }`}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-primary text-xl hover:text-red-400 transition"
        >
          ✖
        </button>

        {/* Contenu du modal */}
        {children}
      </div>
    </div>
  );
}
