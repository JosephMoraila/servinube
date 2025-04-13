import React from 'react';
import './LoadingProgressBar.css';

interface LoadingBarProps {
  isLoading: boolean; 
  /*Desde el archivo donde se importa LoadingBar se le debe pasar con un parametro bool para saber si esta cargando o no*/
}

const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading }) => {
  return (
    <div className={`loading-bar ${isLoading ? 'loading' : ''}`}> {/*En este div es la barra transparente*/}
      <div className="loading-progress" style={{ backgroundColor: '#007bff' }}/> {/*En este div aparecerá la barra de color*/}
    </div>
  );
};

export default LoadingBar;
