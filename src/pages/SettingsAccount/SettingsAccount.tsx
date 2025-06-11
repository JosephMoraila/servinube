import React, { FormEvent, useState, useEffect } from 'react';
import './SettingsAccount.css';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MessageBox from '../../components/MessageBox/MessageBox';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessageBoxContext } from '../../contexts/MessageBoxContext';
import { useLoadingBar } from '../../contexts/LoadingBarContext';
import API_BASE_URL from '../../constants/PAGE_URL';
import { useAuth } from '../../components/ProtectedRoute/ProtectedRoute';
import DialogInput from '../../components/CuadroDialogoInput/CuadroDialogoInput';

const SettingsAccount: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { setIsLoadingBar } = useLoadingBar();
    const {messageMessageBox, setMessageMessageBox, setColorMessageBox} = useMessageBoxContext();
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [isNameFetched, setIsNameFetched] = useState<boolean>(false);


    const [errorMessages, setErrorMessages] = useState<string[]>([]); // Cambiar el estado de error a un arreglo
    const handleLogout = async () => {
        setIsLoadingBar(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/logout`, {}, {
                withCredentials: true
            });
    
            if (response.data.success) {
                localStorage.removeItem('userName');
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

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        const errors = [];
        setErrorMessages([]);

        // Validaciones
        if (newPassword.length < 4) {
            errors.push("La contraseña debe tener al menos 4 caracteres");
        }
        if (newPassword !== confirmPassword) {
            errors.push("Las contraseñas no coinciden");
        }

        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }

        setIsLoadingBar(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/change-password`,
                {
                    userId,
                    newPassword
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setMessageMessageBox('Contraseña actualizada correctamente');
                setColorMessageBox('#008000');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            console.error('Error al cambiar contraseña:', error);
            setMessageMessageBox(error.response?.data?.message || 'Error al cambiar la contraseña');
            setColorMessageBox('#ff0000');
        } finally {
            setIsLoadingBar(false);
        }
    };

    const handleDeleteAccount = async (password: string) => {
        setIsLoadingBar(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/delete-account`,
                {
                    userId,
                    password
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                localStorage.removeItem('userName');
                setMessageMessageBox('Cuenta eliminada correctamente');
                setColorMessageBox('#008000');
                navigate('/');
            }
        } catch (error: any) {
            console.error('Error al eliminar cuenta:', error);
            setMessageMessageBox(error.response?.data?.message || 'Error al eliminar la cuenta');
            setColorMessageBox('#ff0000');
        } finally {
            setIsLoadingBar(false);
        }
    };

    useEffect(() => {
        if (!userId) return;

        const cachedName = localStorage.getItem('userName');

        if (cachedName) {
            setUserName(cachedName);
            setIsNameFetched(true);
        } else {
            const fetchUserName = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/get-name`, {
                        params: { userId },
                        withCredentials: true
                    });

                    if (response.data.success && response.data.name) {
                        setUserName(response.data.name);
                        localStorage.setItem('userName', response.data.name);
                    }
                } catch (error) {
                    console.error('Error al obtener el nombre de usuario:', error);
                } finally {
                    setIsNameFetched(true);
                }
            };

            fetchUserName();
        }
    }, [userId]);


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
                            <br />
                            <p>Nombre usuario: {userName || 'Cargando...'}</p>
                            <br />
                            <form onSubmit={handlePasswordChange}>
                                <p>Nueva contraseña:</p>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nueva contraseña"
                                />
                                <br />
                                <p>Confirmar nueva contraseña:</p>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmar contraseña"
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
                                <button type="submit">Guardar</button>
                                <br />
                                <button 
                                    type="button" 
                                    className='delete-accout-button'
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                Eliminar cuenta
                                </button>
                
                                <DialogInput
                                    isOpen={showDeleteDialog}
                                    onClose={() => setShowDeleteDialog(false)}
                                    onConfirm={handleDeleteAccount}
                                    title="Eliminar cuenta"
                                    description="Esta acción no se puede deshacer. Por favor, ingresa tu contraseña para confirmar."
                                    placeholder="Contraseña"
                                    confirmText="Eliminar"
                                    cancelText="Cancelar"
                                    typeInput="password"
                                />
                            </form>
                        </>
                    );
            default:
                return <p>Selecciona una opción para ver sus configuraciones.</p>;
        }
    };

    return (
        <div className="settings-container">
            {messageMessageBox && <MessageBox message={messageMessageBox} />}
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
