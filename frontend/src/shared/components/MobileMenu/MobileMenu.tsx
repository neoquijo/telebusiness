import React, { useState } from 'react';
import styles from './MobileMenu.module.css';

interface MobileMenuProps {
  children: React.ReactNode;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.mobileMenuContainer}>
      <button 
        className={`${styles.hamburgerButton} ${isOpen ? styles.active : ''}`}
        onClick={toggleMenu}
        aria-label="Меню"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`${styles.menuOverlay} ${isOpen ? styles.open : ''}`}>
        <nav className={styles.menuContent}>
          {children}
        </nav>
      </div>
    </div>
  );
}; 