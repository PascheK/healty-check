'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types/user';
import { usePendingSync } from '@/lib/hooks/usePendingSync';

type Props = {
  categories: Category[];
  onToggle: (categoryName: string, goalIndex: number) => void;
};

export default function Checklist({ categories, onToggle }: Props) {
  // 🌟 State
  const [openSections, setOpenSections] = useState<boolean[]>([]);

  // 🌟 Initialisation des sections ouvertes
  useEffect(() => {
    setOpenSections(Array(categories.length).fill(true));
  }, [categories]);

  // 🌟 Gestion ouverture/fermeture des sections
  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.map((open, i) => (i === index ? !open : open))
    );
  };

  const pendingSync = usePendingSync();


  // 🌟 Affichage
  return (
    <div className="space-y-4">
      {categories.map((category, categoryIndex) => {
          const isPending = pendingSync?.categories.some(
            (pendingCat) => pendingCat.name === category.name
          );
        return(

        <div
          key={category.name}
          className="rounded border border-gray-700 shadow-sm bg-gray-800 text-gray-100"
        >
          {/* Header repliable */}
          <div
            className="flex justify-between items-center px-4 py-3 bg-gray-700 cursor-pointer rounded-t"
            onClick={() => toggleSection(categoryIndex)}
          >
            <h2 className="text-md font-semibold">{category.name} {isPending && (
            <span className="text-xs text-yellow-400">
              🕑 Non synchronisé
            </span>
          )}</h2>
            <span className="text-gray-400">
              {openSections[categoryIndex] ? '−' : '+'}
            </span>
          </div>

          {/* Objectifs de la catégorie */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              openSections[categoryIndex]
                ? 'max-h-[999px] opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <ul className="px-4 py-3 space-y-2">
              {category.goals.map((goal, goalIndex) => (
                <li
                  key={goal.title}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
                  onClick={() => onToggle(category.name, goalIndex)}
                >
                  <input
                    type="checkbox"
                    checked={goal.checked}
                    readOnly
                    className="w-4 h-4 accent-blue-500 pointer-events-none transition-transform duration-150 scale-100 checked:scale-125 checked:rotate-6"
                  />
                  <span
                    className={`text-sm text-gray-200 transition-all duration-150 ${
                      goal.checked ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {goal.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
      }
      )}
    </div>
  );
}
