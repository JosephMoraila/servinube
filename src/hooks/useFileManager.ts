import { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../constants/PAGE_URL';

interface FileProgress {
  name: string;
  progress: number;
}

export const useFileManager = (userId: string | null, currentFolder: string, fetchFiles: () => Promise<void>) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileProgress[]>([]);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(files.map(file => ({ name: file.name, progress: 0 })));

    try {
      await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        await axios.post(`${API_BASE_URL}/api/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          params: {
            userId,
            folder: currentFolder
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
            setUploadProgress(prev => 
              prev.map(item => 
                item.name === file.name 
                  ? { ...item, progress: percentCompleted }
                  : item
              )
            );
          }
        });
      }));

      await fetchFiles();
      return true;
    } catch (error) {
      console.error("❌ Error al subir archivos:", error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  const downloadFile = async (fileName: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download`, {
        params: { 
          fileName,
          folder: currentFolder,
          userId 
        },
        responseType: 'blob',
        withCredentials: true
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al descargar archivo:", error);
      throw error;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadFiles,
    downloadFile
  };
};
