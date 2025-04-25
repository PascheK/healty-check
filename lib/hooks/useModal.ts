import { useState } from 'react';

export function useModal(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const [closing, setClosing] = useState(false);

  const openModal = () => setOpen(true);

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 200); // doit correspondre à l'animation de sortie
  };

  return {
    isOpen: open,
    isClosing: closing,
    openModal,
    closeModal,
  };
}
