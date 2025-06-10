import { FC, useEffect, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface SharedContextMenuProps {
    x: number;
    y: number;
    file: string;
    onUnshare: (file: string) => void;
}

export const SharedContextMenu: FC<SharedContextMenuProps> = ({
    x,
    y,
    file,
    onUnshare
}) => {
    const { effectiveMode } = useDarkMode();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;

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
                DEJAR DE COMPARTIR
            </div>
        </div>
    );
};
