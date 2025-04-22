'use client';

import { useEffect, useState } from 'react';

type Props = {
  user: any;
  checked: Record<string, boolean>;
  toggle: (item: string) => void;
};

export default function Checklist({ user, checked, toggle }: Props) {
  const [openSections, setOpenSections] = useState<boolean[]>([]);

  useEffect(() => {
    if (user?.categories) {
      setOpenSections(user.categories.map(() => true)); // toutes ouvertes par défaut
    }
  }, [user]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.map((val, i) => (i === index ? !val : val))
    );
  };

  if (!user?.categories) return null;

  return (
    <div className="space-y-4">
      {user.categories.map((cat: any, index: number) => (
        <div
          key={cat.nom}
          className="rounded border border-gray-700 shadow-sm bg-gray-800 text-gray-100"
        >
          {/* En-tête repliable */}
          <div
            className="flex justify-between items-center px-4 py-3 bg-gray-700 cursor-pointer rounded-t"
            onClick={() => toggleSection(index)}
          >
            <h2 className="text-md font-semibold">{cat.nom}</h2>
            <span className="text-gray-400">{openSections[index] ? '−' : '+'}</span>
          </div>

          {/* Liste des objectifs */}
          <div
  className={`transition-all duration-300 ease-in-out overflow-hidden ${
  openSections[index]
    ? 'max-h-[999px] opacity-100'
    : 'max-h-0 opacity-0'
  }`}
>
  <ul className="px-4 py-3 space-y-2">
    {cat.objectifs.map((item: string) => (
      <li
        key={item}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
        onClick={() => toggle(item)}
      >
        <input
          type="checkbox"
          checked={!!checked[item]}
          readOnly
          className="w-4 h-4 accent-blue-500 pointer-events-none transition-transform duration-150 scale-100 checked:scale-125 checked:rotate-6"
        />
        <span className={`text-sm text-gray-200 transition-all duration-150 ${
    checked[item] ? 'line-through opacity-60' : ''
  }`}>{item}</span>
      </li>
    ))}
  </ul>
</div>
        </div>
      ))}
    </div>
  );
}
