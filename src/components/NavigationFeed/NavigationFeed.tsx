// Navigation.tsx
import { NavLink } from 'react-router-dom'; // Importamos NavLink para la navegación entre páginas
import '../Navigation/Navigation.css'
import { useState } from 'react'; // Importamos useState
import favicon from "/images/favicon.png";
import favicon_white from "/images/favicon_white.png"
import sun from '/images/Sun.png'
import moon from '/images/Moon.png'
import moon_white from '/images/Moon_white.png'
import { useDarkMode } from '../../contexts/DarkModeContext'
import white_computer from '/images/Computer_white.png'
import black_computer from '/images/Computer_black.png'
import gear_white from '/images/Gear_white.png'
import gear_black from '/images/Gear_black.png'

const Navigation: React.FC = () => {
  const [rotate, setRotate] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClickRotateGear = () => {
    setRotate(true); // Activar la rotación
    setTimeout(() => setRotate(false), 1000); // Desactivar después de 1s (duración de la animación)
  };


  // Definimos el estado 'isOpen' que controla si el menú desplegable está abierto o cerrado.
  const [isOpen, setIsOpen] = useState(false);

  // Obtén el estado y la función para alternar el modo oscuro desde el contexto
  const { toggleMode, effectiveMode, mode } = useDarkMode();

  // Esta función invierte el valor del estado 'isOpen' cada vez que se llama.
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

  const themeGear = effectiveMode === 'dark' ? gear_white : gear_black

  return (
    <nav className="container-nav">
      {/* Contenedor izquierdo: Logo y enlaces */}
      <div className="container-left">
        {/* Logo de la empresa o sitio web */}
        <div>
          <NavLink to="/feed">
            <img src={faviconSrc} alt="logo" />
          </NavLink>
        </div>
  
        {/* Enlaces de navegación que se muestran en pantallas grandes */}
        <div className="enlaces">
          <ul>
            <li>
              {/*Se pone 'end' para que isActive se active solamene cuando coincide exactamente con /feed*/}
              <NavLink to="/feed" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Mi Unidad
              </NavLink>
            </li>
            <li>
              <NavLink to="/feed/trash" className={({ isActive }) => (isActive ? 'active' : '')}>
                Papelera
              </NavLink>
            </li>
            <li>
              <NavLink to="/feed/shared" className={({ isActive }) => (isActive ? 'active' : '')}>
                Compartido
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
  
      {/* Contenedor derecho: Tema y configuraciones */}
      <div className="container-right">
        {/* Alternar tema */}
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
        <NavLink to="/feed/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
          <img src={themeGear} alt="Options" style={{
          width: '35px',
          height: '35px',
          objectFit: 'contain',
          transition: 'transform 1s ease-in-out', // Animación de transición
          transform: rotate ? 'rotate(360deg)' : 'rotate(0deg)', // Rotación condicional
        }} onClick={handleClickRotateGear}/>
        </NavLink>
      </div>

      {/* Menú hamburguesa para pantallas pequeñas */}
      
      <button className={`menu-toggle ${isOpen ? 'active' : 'close'} ${effectiveMode === 'dark' ? 'dark' : ''}`} onClick={toggleMenu}>
        {isOpen ? 'x' : '≡'}
      </button>
  
      {/* Menú desplegable para pantallas pequeñas */}
      <nav className={`nav-narrow ${isOpen ? 'open' : 'close'}`}>
        <div className='nav-phone-div'>
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
                <NavLink to="/feed" end className={({ isActive }) => (isActive ? 'active' : '')}>
                  Mi Unidad
                </NavLink>
              </li>
              <li>
                <NavLink to="/feed/trash" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Papelera
                </NavLink>
              </li>

              <li>
                <NavLink to="/feed/shared" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Compartido
                </NavLink>
              </li>
    
              <li>
                <NavLink to="/feed/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Configuación
                </NavLink>
              </li>

            </ul>
        </div>
      </nav>
    </nav>
  );
}  

export default Navigation;
