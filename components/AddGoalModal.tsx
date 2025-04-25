'use client';

import { useState } from 'react';
import ModalWrapper from '@/components/common/ModalWrapper';

type Props = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onAddGoal: (categoryName: string, goalName: string) => void;
  categories: string[]; // Liste des catégories existantes
};

export default function AddGoalModal({ isOpen, isClosing, onClose, onAddGoal, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [goalName, setGoalName] = useState('');

  const handleSubmit = () => {
    if (!selectedCategory || goalName.trim() === '') return;
    onAddGoal(selectedCategory, goalName.trim());
    setSelectedCategory('');
    setGoalName('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-center">Nouvel objectif</h2>

      {/* Sélection catégorie */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full mb-4 px-4 py-2 bg-[#1e1e2e] border border-gray-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      >
        <option value="">Choisir une catégorie</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Nom objectif */}
      <input
        type="text"
        placeholder="Nom de l'objectif"
        value={goalName}
        onChange={(e) => setGoalName(e.target.value)}
        className="w-full mb-6 px-4 py-2 bg-[#1e1e2e] border border-gray-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={categories.length === 0}
          className={`px-4 py-2 text-white font-semibold rounded ${
            categories.length === 0
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Ajouter
        </button>
      </div>
    </ModalWrapper>
  );
}
