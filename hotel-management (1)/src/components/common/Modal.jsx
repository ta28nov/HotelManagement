import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './Modal.css';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } }, // Delay exit slightly
};

const modalVariants = {
  hidden: { opacity: 0, y: "-30px", scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: "30px",
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Reusable Modal Component
 *
 * Props:
 * - isOpen (boolean): Controls modal visibility.
 * - onClose (function): Function to call when the modal should close (backdrop click, close button).
 * - title (string, optional): Title displayed in the modal header.
 * - children (node): Content to display inside the modal body.
 * - className (string, optional): Additional class names for the modal content container for custom styling.
 * - footer (node, optional): Content for the modal footer (e.g., action buttons).
 * - size (string, optional): 'sm', 'md', 'lg', 'xl' for predefined sizes. Defaults to 'md'.
 */
const Modal = ({ isOpen, onClose, title, children, className = '', footer, size = 'md' }) => {

  // Handle Escape key press to close modal
  React.useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    } else {
      document.removeEventListener('keydown', handleEsc);
    }
    // Cleanup listener on component unmount or when isOpen changes
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent closing modal when clicking inside content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence mode="wait"> {/* Use mode='wait' for smoother exit/enter transitions */} 
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} // Close when clicking backdrop
        >
          <motion.div
            className={`modal-content modal-size-${size} ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleContentClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* Header */} 
            <div className="modal-header">
              {title && <h3 id="modal-title" className="modal-title">{title}</h3>}
              <button
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */} 
            <div className="modal-body">
              {children}
            </div>

            {/* Footer (Optional) */} 
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 