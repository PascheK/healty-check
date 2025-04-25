'use client';

import { useState } from 'react';
import { useModal } from '@/lib/hooks/useModal';
import ModalWrapper from '@/components/common/ModalWrapper';

type Props = {
  onCreate: (data: { firstName: string; lastName:string; code: string; role: 'user' | 'admin' }) => void;
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
};

export default function AddUserModal({ onCreate, isOpen, isClosing, onClose }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const handleSubmit = () => {
    onCreate({ firstName,lastName, code, role });
    setFirstName('');
    setLastName('');
    setCode('');
    setRole('user');
    onClose();
  };


  return (
        <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
        <h2 className="text-xl font-bold mb-4">Nouvel utilisateur</h2>

        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full mb-3 px-3 py-2 bg-[#1e1e2e] border border-gray-500 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full mb-3 px-3 py-2 bg-[#1e1e2e] border border-gray-500 rounded transition duration-200 focus:outline-none focus:ring-focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full mb-3 px-3 py-2 bg-[#1e1e2e] border border-gray-500 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
          className="w-full mb-4 px-3 py-2 bg-[#1e1e2e] border border-gray-500 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="user">Utilisateur</option>
          <option value="admin">Administrateur</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 px-4 py-2 text-white font-semibold rounded hover:bg-blue-700"
          >
            Créer
          </button>
        </div>
      </ModalWrapper>
  );
}

 