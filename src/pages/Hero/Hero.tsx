import './Hero.css'; // Importación correcta si Hero.css está en el mismo directorio
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la navegación
import { useDarkMode } from '../../contexts/DarkModeContext'; // Asegúrate de importar el hook

const HeroSection = () => {

  const navigate = useNavigate(); // Hook para navegar entre rutas
  const { effectiveMode } = useDarkMode(); 
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDateTime = new Date().toLocaleString(navigator.language, {
    timeZone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // Obtener la fecha y hora actual sin segundos
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(tomorrow.getHours() + 1);
  const tomorrowDateTime = tomorrow.toLocaleString(navigator.language, {
    timeZone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Moverse al inicio con animación suave
  };

  return (
    <main className="hero-container"> {/*Este elemento main está usando dos clases separados por espacios que es hero y container*/}
      <div className="hero-content">
        <h1>ALMACENA TU NUBE LOCAL</h1>
        <p className='p-hero'>Tu nube local para guardar tus archivos gratis y de codigo abierto</p>
        

        <div className="hero-btn">
          <button onClick={() => handleNavigate('/WhatIsItAbout')}>¿DE QUE TRATA?</button> {/*Si '/WhatIsItAbout' está en Router cargará la página sin problemas */}

          <button className={`secondary-btn ${effectiveMode === 'dark' ? 'dark' : ''}`} onClick={() => navigate('/Register')}>Registrarse</button>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;