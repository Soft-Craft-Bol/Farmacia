import React, { memo } from 'react';
import { IoCloseSharp } from '../../hooks/icons';
import './Modal.css';
import { ButtonPrimary } from '../buttons/ButtonPrimary';

const Modal = memo(({ isOpen, onClose, children, theme = 'light' }) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${theme}`}>
      <div className={`modal-content ${theme}`}>
        <ButtonPrimary
          variant="secondary" 
          theme={theme} 
          onClick={onClose} 
          className="close-btn"
        > 
          <IoCloseSharp/>
        </ButtonPrimary>
        {children}
      </div>
    </div>
  );
});

export default Modal;
