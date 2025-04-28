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
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = () => {
    if (categoryName.trim() === '') return;
    onAddCategory(categoryName.trim());
    setCategoryName('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-center">Nouvelle catégorie</h2>

      <input
        type="text"
        placeholder="Nom de la catégorie"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        className="w-full mb-6 px-4 py-2 bg-foreground border border-border text-text-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />

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
