'use client';


import { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/types/user';

type Props = {
  categories: Category[];
  onToggle: (categoryName: string, goalIndex: number) => void;
  onDeleteCategory: (categoryName: string) => void;
  onDeleteGoal: (categoryName: string, goalTitle: string) => void;
  modeEdition: boolean;
};

export default function Checklist({
  categories,
  onToggle,
  onDeleteCategory,
  onDeleteGoal,
  modeEdition,
}: Props) {
  const [openSections, setOpenSections] = useState<boolean[]>([]);

  useEffect(() => {
    setOpenSections(Array(categories.length).fill(true));
  }, [categories.length]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.map((open, i) => (i === index ? !open : open))
    );
  };

  return (
    <div className="space-y-4">
      {categories.map((category, categoryIndex) => (
        <div
          key={category.name}
          className="rounded border border-gray-700 shadow-sm bg-gray-800 text-gray-100"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-primary-dark rounded-t cursor-pointer">
            <div className="flex items-center gap-2" onClick={() => toggleSection(categoryIndex)}>
              {openSections[categoryIndex] ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
              <h2 className="text-md font-semibold">{category.name}</h2>
            </div>

            {/* Bouton supprimer catégorie */}
            {modeEdition && (
  <button
    onClick={() => onDeleteCategory(category.name)}
    className="text-red-400 hover:text-red-600 transition-transform duration-300 hover:animate-shake  "
    title="Supprimer catégorie"
  >
    <Trash2 size={18} />
  </button>
)}
          </div>

          {/* Objectifs */}
          <div
            className={`transition-all duration-300 ease-in-out  overflow-hidden ${
              openSections[categoryIndex]
                ? 'max-h-[999px] opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <ul className="px-4 py-3 space-y-2">
              {category.goals.map((goal, goalIndex) => (
                <li
                  key={goal.title}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-gray-700"
                >
                  <div
                    className="flex items-center gap-2 cursor-pointer w-full"
                    onClick={() => onToggle(category.name, goalIndex)}
                  >
                    <input
                      type="checkbox"
                      checked={goal.checked}
                      readOnly
                      className="w-4 h-4 accent-blue-500 pointer-events-none transition-transform duration-150 scale-100 checked:scale-125 checked:rotate-6"
                    />
                    <span
                      className={`text-sm ${
                        goal.checked ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {goal.title}
                    </span>
                  </div>

                  {/* Bouton supprimer objectif */}
                  {modeEdition && (
  <button
    onClick={() => onDeleteGoal(category.name, goal.title)}
    className="text-red-400 hover:text-red-600 transition-transform duration-300 hover:animate-shake "
    title="Supprimer objectif"
  >
    <Trash2 size={16} />
  </button>
)}

                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}