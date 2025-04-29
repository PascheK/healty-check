'use client';

import { useState } from 'react';
import ModalWrapper from '@/components/common/ModalWrapper';

type Props = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onAddCategory: (name: string) => void;
};

export default function AddCategoryModal({ isOpen, isClosing, onClose, onAddCategory }: Props) {
  // 🔵 État local pour le champ de saisie
  const [categoryName, setCategoryName] = useState('');

  // 🔵 Gestion de la soumission du formulaire
  const handleSubmit = () => {
    if (categoryName.trim() === '') return; // Empêche la création d'une catégorie vide

    onAddCategory(categoryName.trim()); // Appelle la fonction parent avec la valeur propre
    setCategoryName(''); // Réinitialiser le champ après création
    onClose(); // Fermer le modal
  };

  // 🔵 Rendu
  return (
    <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      {/* Titre du modal */}
      <h2 className="text-xl font-bold mb-4 text-center">Nouvelle catégorie</h2>

      {/* Champ de saisie */}
      <input
        type="text"
        placeholder="Nom de la catégorie"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        className="w-full mb-6 px-4 py-2 bg-foreground border border-border text-text-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 px-4 py-2 text-text-primary font-semibold rounded hover:bg-green-700"
        >
          Créer
        </button>
      </div>
    </ModalWrapper>
  );
}
