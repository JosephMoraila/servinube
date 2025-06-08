export const getFileIcon = (name: string, isDirectory: boolean, mimeType?: string | null): string => {
  // Si es un directorio, retornar icono de carpeta
  if (isDirectory) {
    return '📁';
  }

  // Si tenemos el mimeType, usarlo para determinar el icono
  if (mimeType) {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    }
    if (mimeType.startsWith('video/')) {
      return '🎥';
    }
    if (mimeType.startsWith('audio/')) {
      return '🎵';
    }
    if (mimeType === 'application/pdf') {
      return '📄';
    }
    if (mimeType.includes('compressed') || mimeType.includes('zip') || mimeType.includes('archive')) {
      return '🗜️';
    }
    if (mimeType.includes('text/')) {
      return '📃';
    }
  }

  // Si no hay mimeType o no es un tipo reconocido, usar la extensión como fallback
  const extension = name.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    // Imágenes
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
      return '🖼️';
    // Documentos
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📽️';
    case 'pdf':
      return '📄';
    case 'txt':
    case 'md':
      return '📃';
    // Código
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
      return '👨‍💻';
    // Por defecto
    default:
      return '📄';
  }
};
