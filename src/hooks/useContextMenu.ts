import { useState } from 'react';

interface ContextMenuState {
  x: number;
  y: number;
  file: string;
  isDirectory: boolean;
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = (e: React.MouseEvent, fileName: string, isDirectory: boolean) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      file: fileName,
      isDirectory
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu
  };
};
