import { FC } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface UploadProgressProps {
  uploadProgress: Array<{
    name: string;
    progress: number;
  }>;
}

export const UploadProgress: FC<UploadProgressProps> = ({ uploadProgress }) => {
  const { effectiveMode } = useDarkMode();

  return (
    <div className={`upload-progress ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      {uploadProgress.map((file) => (
        <div key={file.name} className={`progress-item ${effectiveMode === 'dark' ? 'dark' : ''}`}>
          <span className="filename">{file.name}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <span className="progress-text">{file.progress}%</span>
        </div>
      ))}
    </div>
  );
};
