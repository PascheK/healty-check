// lib/hooks/useChecklist.ts
'use client';

import { useEffect, useState } from 'react';

const getToday = () => new Date().toISOString().split('T')[0];

export function useChecklist(userCode: string | null) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userCode) return;

    const saved = localStorage.getItem(`checklist-${userCode}`);
    const savedDate = localStorage.getItem(`checklist-date-${userCode}`);
    const today = getToday();

    if (saved && savedDate === today) {
      setChecked(JSON.parse(saved));
    } else {
      localStorage.removeItem(`checklist-${userCode}`);
      localStorage.setItem(`checklist-date-${userCode}`, today);
      setChecked({});
    }
  }, [userCode]);

  const toggle = (item: string) => {
    const newState = { ...checked, [item]: !checked[item] };
    setChecked(newState);
    if (userCode) {
      localStorage.setItem(`checklist-${userCode}`, JSON.stringify(newState));
      localStorage.setItem(`checklist-date-${userCode}`, getToday());
    }
  };

  return { checked, toggle };
}
