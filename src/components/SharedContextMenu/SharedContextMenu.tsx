import { FC, useEffect, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import './SharedContextMenu.css';

interface SharedContextMenuProps {
    x: number;
    y: number;
    file: string;
    onUnshare: (file: string) => void;
    onClose: () => void;
}

export const SharedContextMenu: FC<SharedContextMenuProps> = ({
    x,
    y,
    file,
    onUnshare,
    onClose
}) => {
    const { effectiveMode } = useDarkMode();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Si el click o touch fue fuera del menú, cerrarlo
                onClose();
            }
        };

        // Agregar los event listeners al documento
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            // Limpiar los event listeners cuando el componente se desmonte
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;

        // Resetear el display a block cuando cambian las coordenadas
        menu.style.display = 'block';

        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Ajustar posición horizontal si se sale de la pantalla
        let adjustedX = x;
        if (x + rect.width > viewportWidth) {
            adjustedX = viewportWidth - rect.width - 10;
        }
        if (adjustedX < 0) {
            adjustedX = 10;
        }

        // Ajustar posición vertical si se sale de la pantalla
        let adjustedY = y;
        if (y + rect.height > viewportHeight) {
            adjustedY = viewportHeight - rect.height - 10;
        }
        if (adjustedY < 0) {
            adjustedY = 10;
        }

        menu.style.left = `${adjustedX}px`;
        menu.style.top = `${adjustedY}px`;
    }, [x, y]);

    return (
        <div 
            ref={menuRef}
            className={`context-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}
            style={{ position: 'fixed' }}
        >
            <div className="menu-item delete" onClick={() => onUnshare(file)}>
                <span className="icon">🚫</span>
                DEJAR DE COMPARTIR CON TODOS
            </div>
        </div>
    );
};
