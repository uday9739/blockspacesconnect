import { useEffect } from 'react';

export const useOutsideClick = (onOutsideClick, refComponent) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        refComponent.current &&
        !refComponent.current.contains(event.target)
      ) {
        onOutsideClick();
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);
};
