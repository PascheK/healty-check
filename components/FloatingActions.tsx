'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import { Plus, FolderPlus, Target, Pencil, X, LogOut } from 'lucide-react';

type Props = {
  onAddCategory: () => void;
  onAddGoal: () => void;
  onToggleEdition: () => void;
  onLogout: () => void;
  modeEdition: boolean;
};

export default function FloatingActions({ onAddCategory, onAddGoal, onToggleEdition, onLogout, modeEdition }: Props) {
  // 🔵 États
  const [open, setOpen] = useState(false); // Etat pour ouvrir/fermer les actions
  const wrapperRef = useRef<HTMLDivElement>(null); // Ref pour détecter clics extérieurs

  // 🔵 Gestion de la fermeture si clic à l'extérieur du menu
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

  // 🔵 Rendu
  return (
    <>
      {/* Fond semi-transparent quand ouvert */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity ease-in-out"
        />
      )}

      {/* Container des actions flottantes */}
      <div ref={wrapperRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Bouton Ajouter Catégorie */}
        <ActionButton
          open={open}
          delay={0}
          label="Nouvelle catégorie"
          onClick={() => { onAddCategory(); setOpen(false); }}
          bgColor="bg-green-600 hover:bg-green-700"
          icon={<FolderPlus size={28} />}
        />

        {/* Bouton Ajouter Objectif */}
        <ActionButton
          open={open}
          delay={100}
          label="Nouvel objectif"
          onClick={() => { onAddGoal(); setOpen(false); }}
          bgColor="bg-blue-600 hover:bg-blue-700"
          icon={<Target size={28} />}
        />

        {/* Bouton Mode Édition */}
        <ActionButton
          open={open}
          delay={200}
          label={modeEdition ? 'Terminer' : 'Modifier'}
          onClick={() => { onToggleEdition(); setOpen(false); }}
          bgColor="bg-orange-600 hover:bg-orange-700"
          icon={modeEdition ? <X size={24} /> : <Pencil size={24} />}
        />

        {/* Bouton Déconnexion */}
        <ActionButton
          open={open}
          delay={300}
          label="Déconnexion"
          onClick={() => { onLogout(); setOpen(false); }}
          bgColor="bg-red-600 hover:bg-red-700"
          icon={<LogOut size={24} />}
        />

        {/* Bouton principal d'ouverture/fermeture */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-text-primary shadow-2xl transition-transform duration-500 ease-in-out ${
            open ? 'rotate-45 scale-110' : 'rotate-0 scale-100'
          } hover:rotate-90`}
        >
          <Plus size={32} />
        </button>
      </div>
    </>
  );
}

// 🔵 Extraction d'un sous-composant ActionButton pour éviter la répétition
function ActionButton({
  open,
  delay,
  label,
  onClick,
  bgColor,
  icon,
}: {
  open: boolean;
  delay: number;
  label: string;
  onClick: () => void;
  bgColor: string;
  icon: JSX.Element;
}) {
  return (
    <div
      className={`flex items-center gap-2 transition-all delay-${delay} ${
        open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
      } duration-500 ease-out`}
    >
      <span
        className={`bg-foreground text-text-primary text-sm px-3 py-1 rounded-full shadow-md transition-all ${
          open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        } duration-500 ease-out`}
      >
        {label}
      </span>

      <button
        onClick={onClick}
        className={`flex items-center justify-center w-14 h-14 rounded-full ${bgColor} text-text-primary shadow-lg transition-transform hover:scale-110 duration-300`}
      >
        {icon}
      </button>
    </div>
  );
}
