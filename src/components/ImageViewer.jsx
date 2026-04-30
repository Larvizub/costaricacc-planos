import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

const Content = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90vw;
  max-height: 90vh;
`;

const Img = styled.img`
  max-width: 88vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  display: block;
  user-select: none;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 16px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.2s;
  z-index: 10000;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const NavButton = styled.button`
  position: fixed;
  top: 50%;
  ${({ $left }) => ($left ? 'left: 16px;' : 'right: 16px;')}
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.2s;
  z-index: 10000;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Counter = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 14px;
  border-radius: 20px;
`;

const OpenOriginalLink = styled.a`
  position: fixed;
  top: 16px;
  right: 68px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  z-index: 10000;
  text-decoration: none;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

/**
 * Visor de imágenes (lightbox).
 * @param {string[]} images - Array de URLs de imágenes
 * @param {number} initialIndex - Índice de la imagen inicial
 * @param {function} onClose - Callback para cerrar el visor
 */
const ImageViewer = ({ images = [], initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, images.length - 1));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    },
    [onClose, goNext, goPrev]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!images || images.length === 0) return null;

  return (
    <Overlay onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <Img src={images[currentIndex]} alt={`Imagen ${currentIndex + 1} de ${images.length}`} />
      </Content>

      <CloseButton onClick={onClose} title="Cerrar">
        <FaTimes />
      </CloseButton>

      <OpenOriginalLink
        href={images[currentIndex]}
        target="_blank"
        rel="noopener noreferrer"
        title="Ver imagen original"
        onClick={(e) => e.stopPropagation()}
      >
        <FaExpand />
      </OpenOriginalLink>

      {images.length > 1 && currentIndex > 0 && (
        <NavButton $left onClick={goPrev} title="Imagen anterior">
          <FaChevronLeft />
        </NavButton>
      )}

      {images.length > 1 && currentIndex < images.length - 1 && (
        <NavButton onClick={goNext} title="Imagen siguiente">
          <FaChevronRight />
        </NavButton>
      )}

      {images.length > 1 && (
        <Counter>
          {currentIndex + 1} / {images.length}
        </Counter>
      )}
    </Overlay>
  );
};

export default ImageViewer;
