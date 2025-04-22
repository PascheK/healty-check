// lib/hooks/useCurrentUser.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useCurrentUser(secret: string) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const code = localStorage.getItem('userCode');
    if (!code) return router.push('/login');

    fetch('/api/users', {
      headers: { Authorization: `Bearer ${secret}` },
    })
      .then((res) => res.json())
      .then((users) => {
        const found = users.find((u: any) => u.code === code);
        if (!found) return router.push('/login');
        setUser(found);
      });
  }, [secret]);

  return user;
}
