import React, { FormEvent, useEffect, useState } from 'react';
import './SettingsAccount.css';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MessageBox from '../../components/MessageBox/MessageBox';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessageBoxContext } from '../../contexts/MessageBoxContext';
import { useLoadingBar } from '../../contexts/LoadingBarContext';

const SettingsAccount: React.FC = () => {
    const navigate = useNavigate();
    const { setIsLoadingBar } = useLoadingBar();
    const {messageMessageBox, setMessageMessageBox, colorMessageBox, setColorMessageBox} = useMessageBoxContext();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userPhone, setUserPhone] = useState<string | null>(null);
    const [registrationDate, setRegistrationDate] = useState<string | null>(null);
    const [userUid, setUserUid] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [newNameUser, setNewNameUser] = useState<string>('');
    const [newPhoneNumber, setNewPhoneNumber] = useState<string>('');
    const [errorMessages, setErrorMessages] = useState<string[]>([]); // Cambiar el estado de error a un arreglo
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
    const [, setAuthPassword] = useState<string>('');

    const handleLogout = async () => {
        setIsLoadingBar(true);
        try {
            const response = await axios.post('http://localhost:3000/api/logout', {}, {
                withCredentials: true
            });
    
            if (response.data.success) {
                setMessageMessageBox('Sesión cerrada correctamente');
                setColorMessageBox('#008000');
                navigate('/');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setMessageMessageBox('Error al cerrar sesión');
            setColorMessageBox('#ff0000');
        } finally {
            setIsLoadingBar(false);
        }
    };


    const [activeSetting, setActiveSetting] = useState<string>('general');

    const settingsOptions = [
        { key: 'general', label: 'General' },
        { key: 'account', label: 'Cuenta' },
    ];

    const renderSettingContent = (key: string) => {
        switch (key) {
            case 'general':
                return (
                    <>
                        <p>Configuraciones generales de la aplicación.</p>
                        <br />
                        <button onClick={handleLogout}>Cerrar sesión</button>
                    </>
                );
            case 'account':
                return (
                    <>
                        <p><strong>Ajusta los detalles de tu cuenta.</strong></p>
                        <p>Correo electrónico:</p>
                        <p>{`${userEmail}`}</p>
                        <br />
                        <p>Número celular:</p>
                        <p>{userPhone ? userPhone : 'Cargando...'}</p>
                        <br />
                        <p>Fecha de creación de cuenta:</p>
                        <p>{registrationDate ? registrationDate : 'Cargando...'}</p>
                        <br />
                        <form>
                            <p>Nuevo nombre:</p>
                            <input 
                                type="text" 
                                value={newNameUser}
                                onChange={(e) => setNewNameUser(e.target.value)} 
                            />
                            <br /><br />
                            <p>Nuevo número celular:</p>
                            <input type="tel"
                                value={newPhoneNumber}
                                onChange={(e) => setNewPhoneNumber(e.target.value.trim())} />
                            <br /><br />
                            <p>Contraseña:</p>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <br />
                            <p>Confirmar nueva contraseña:</p>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <br />
                            {errorMessages.length > 0 && (
                            <div className="error-message list-error-settings">
                                <ul>
                                    {errorMessages.map((err, index) => (
                                        <li key={index}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                            <button>Guardar</button>
                            <br />
                            <button type="button" className='delete-accout-button'>Eliminar cuenta</button>
                        </form>
                    </>
                );
            default:
                return <p>Selecciona una opción para ver sus configuraciones.</p>;
        }
    };

    return (
        <div className="settings-container">
            {messageMessageBox && <MessageBox message={messageMessageBox} color={colorMessageBox} />}
            <div className={`settings-sidebar ${useDarkMode().effectiveMode === 'dark' ? 'dark' : ''}`}>
                {settingsOptions.map((option) => (
                    <button
                        key={option.key}
                        className={`settings-option ${activeSetting === option.key ? 'active' : ''} ${useDarkMode().effectiveMode === 'dark' ? 'dark' : ''}`}
                        onClick={() => setActiveSetting(option.key)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <div className={`settings-content ${useDarkMode().effectiveMode === 'dark' ? 'dark' : ''}`}>
                <h2>{settingsOptions.find((opt) => opt.key === activeSetting)?.label}</h2>
                {renderSettingContent(activeSetting)}
            </div>
        </div>
    );
};

export default SettingsAccount;
