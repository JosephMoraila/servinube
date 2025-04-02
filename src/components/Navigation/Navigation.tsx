import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';
import favicon from "/images/favicon.png";
import favicon_white from "/images/favicon_white.png";
import sun from '/images/Sun.png';
import moon from '/images/Moon.png';
import moon_white from '/images/Moon_white.png';
import { useDarkMode } from '../../contexts/DarkModeContext'
import white_computer from '/images/Computer_white.png'
import black_computer from '/images/Computer_black.png'

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { toggleMode, effectiveMode, mode } = useDarkMode();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleTouchStart = () => {
    setShowTooltip(true); // Muestra el tooltip
  };

  const handleTouchEnd = () => {
    setShowTooltip(false); // Oculta el tooltip cuando el usuario deja de tocar
  };

  

  let themeSrc = '';
  // Si el modo es "dark", asignar el ícono correspondiente
  if (mode === 'dark') {
    themeSrc = sun;
  }
  // Si el modo es "light", asignar el ícono correspondiente
  else if (mode === 'light') {
    themeSrc = black_computer;
  }
  // Si el modo es "system", asignar el ícono correspondiente
  else if (mode === 'system' && effectiveMode === 'light') {
    themeSrc = moon;
  }
  // Si el modo es "system" y el modo efectivo es "dark", asignar moon_white
  else if (mode === 'system' && effectiveMode === 'dark') {
    themeSrc = moon_white;
  }

  const faviconSrc = effectiveMode === 'dark' ? favicon_white : favicon;

  const phoneThemeSrc = mode === 'dark' ? sun : mode === 'light' ? white_computer : moon_white;

  return (
    <nav className="container-nav">
      <div className="container-left">
        <div>
          <NavLink to="/">
            <img src={faviconSrc} alt="logo" />
          </NavLink>
        </div>
        <div className="enlaces">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/About" className={({ isActive }) => (isActive ? 'active' : '')}>
                Acerca
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-right">
        <div className="tooltip-container">
          <img 
            src={themeSrc} 
            alt="Theme mode" 
            onClick={toggleMode} 
            style={{ cursor: 'pointer' }} 
          />
          <span className="tooltip-text">
            {`Estás usando: ${
              mode === 'dark' ? 'MODO OBSCURO' : 
              mode === 'light' ? 'MODO CLARO' : 
              'MODO SISTEMA'
            }. Cambiar a: ${
              mode === 'dark' ? 'Claro' : 
              mode === 'light' ? 'Sistema' : 
              'Obscuro'
            }`}
          </span>
        </div>
        <button className="buttonLogin">
          <NavLink to="/login">Login</NavLink>
        </button>
      </div>
      <button className={`menu-toggle ${isOpen ? 'active' : 'close'} ${effectiveMode === 'dark' ? 'dark' : ''}`} onClick={toggleMenu}>
        {isOpen ? 'x' : '≡'}
      </button>
      <nav className={`nav-narrow ${isOpen ? 'open' : 'close'}`}>
        <div className="tooltip-container" onTouchStart={handleTouchStart}  onTouchEnd={handleTouchEnd}>
          <img src={phoneThemeSrc} alt="Theme mode" onClick={toggleMode} style={{ cursor: 'pointer' }} draggable="false" onContextMenu={(e) => e.preventDefault()} />
          {showTooltip && <span className="tooltip-text"> {`Estás usando: ${
              mode === 'dark' ? 'MODO OBSCURO' : 
              mode === 'light' ? 'MODO CLARO' : 
              'MODO SISTEMA'
            }. Cambiar a: ${
              mode === 'dark' ? 'Claro' : 
              mode === 'light' ? 'Sistema' : 
              'Obscuro'
            }`}</span>}
        </div>
        <ul>
          <li>
            <button className="buttonLogin">
              <NavLink to="/login">Login</NavLink>
            </button>
          </li>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/About" className={({ isActive }) => (isActive ? 'active' : '')}>
              Acerca
            </NavLink>
          </li>
        </ul>
      </nav>
    </nav>
  );
};

export default Navigation;
