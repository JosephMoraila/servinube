// NotFound.tsx
import './NotFound.css';
import question_mark from "/images/question-mark.png";
import question_mark_white from "/images/question-mark-white.png";
import { useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext'; // Asegúrate de importar el hook

const NotFound: React.FC = () => {
    const { effectiveMode } = useDarkMode(); // Obtener el estado del modo oscuro
    {/*Usa el hook useDarkMode para saber si el modo oscuro está activado (isDarkMode es true cuando el modo oscuro está activo). Es como preguntar: "¿Es de noche?"*/}

    useEffect(() => {
    }, [effectiveMode]);
    {/*Este hook useEffect está preparado para ejecutarse cuando isDarkMode cambia. Aunque en este caso no tiene ninguna acción dentro, se asegura de que el componente 
    reaccione ante cambios en el estado del modo oscuro. Es como preparar una alarma sin acción, pero que se activa cada vez que se encienden o apagan las luces.*/}

    // Cambiar la imagen según el modo oscuro
    const imageSrc = effectiveMode === 'dark' ? question_mark_white : question_mark;

    return (
        <div className='NotFoundMessage'>
            <h1>404 - Página no encontrada</h1>
            <p>Epa, la página que estás buscando no existe, intenta ingresar una URL correcta</p>
            <img src={imageSrc} alt="Not found" />
        </div>
    );
};

export default NotFound;
