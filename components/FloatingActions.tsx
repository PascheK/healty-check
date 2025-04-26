'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, FolderPlus, Target, Pencil, X } from 'lucide-react';

type Props = {
  onAddCategory: () => void;
  onAddGoal: () => void;
  onToggleEdition: () => void;
  modeEdition: boolean;
};

export default function FloatingActions({ onAddCategory, onAddGoal, onToggleEdition, modeEdition }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <>
      {/* Fond semi-transparent quand ouvert */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" />
      )}

      <div ref={wrapperRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Bouton Ajouter Catégorie */}
        <div
          className={`flex items-center gap-2 transition-all ${
            open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
          } duration-500 ease-out`}
        >
          {/* Label */}
          <span
            className={`bg-[#2a2a3d] text-white text-sm px-3 py-1 rounded-full shadow-md transition-all ${
              open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            } duration-500 ease-out`}
          >
            Nouvelle catégorie
          </span>

          {/* Bouton */}
          <button
            onClick={onAddCategory}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-transform hover:scale-110 duration-300"
          >
            <FolderPlus size={28} />
          </button>
        </div>

        {/* Bouton Ajouter Objectif */}
        <div
          className={`flex items-center gap-2 transition-all delay-100 ${
            open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
          } duration-500 ease-out`}
        >
          {/* Label */}
          <span
            className={`bg-[#2a2a3d] text-white text-sm px-3 py-1 rounded-full shadow-md transition-all ${
              open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            } duration-500 ease-out`}
          >
            Nouvel objectif
          </span>

          {/* Bouton */}
          <button
            onClick={onAddGoal}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-110 duration-300"
          >
            <Target size={28} />
          </button>
        </div>
        {/* Bouton  Edition */}
        <div
          className={`flex items-center gap-2 transition-all delay-100 ${
            open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
          } duration-500 ease-out`}
        >
          {/* Label */}
          <span
            className={`bg-[#2a2a3d] text-white text-sm px-3 py-1 rounded-full shadow-md transition-all ${
              open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            } duration-500 ease-out`}
          >
           {modeEdition ? 'Terminer' : 'Modifier'}
          </span>

          {/* Bouton */}
          <button
            onClick={onToggleEdition}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-transform hover:scale-110 duration-300"
          >
          {modeEdition ? <X size={24} /> : <Pencil size={24} />}

          </button>
        </div>

        {/* Bouton principal ➕ */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-2xl transition-transform duration-500 ${
            open ? 'rotate-45 scale-110' : 'rotate-0 scale-100'
          } ease-in-out`}
        >
          <Plus size={32} />
        </button>
      </div>
    </>
  );
}
