import os from 'os';

class ApiConfig {
    private static instance: ApiConfig;
    private _baseURL: string = 'http://localhost:3000';

    private constructor() {
        // Verifica si estamos en un entorno de navegador
        if (typeof window !== "undefined") {
            // Si estamos en un navegador, usamos el hostname de la ventana
            if (!window.location.hostname.includes('localhost')) {
                this._baseURL = `http://${window.location.hostname}:3000`;
            }
        } else {
            // Si estamos en un entorno de Node.js (backend), obtenemos la IP local
            const interfaces = os.networkInterfaces();
            let ipAddress = 'localhost'; // Valor por defecto

            // Buscar la primera interfaz IPv4 no interna
            for (let interfaceName in interfaces) {
                // Asegurarse de que interfaces[interfaceName] no sea undefined
                if (interfaces[interfaceName]) {
                    for (let iface of interfaces[interfaceName]) {
                        if (iface.family === 'IPv4' && !iface.internal) {
                            ipAddress = iface.address;
                            break;
                        }
                    }
                }
                if (ipAddress !== 'localhost') break;
            }

            // Usamos la IP local obtenida
            this._baseURL = `http://${ipAddress}`;
        }
    }

    public static getInstance(): ApiConfig {
        if (!ApiConfig.instance) {
            ApiConfig.instance = new ApiConfig();
        }
        return ApiConfig.instance;
    }

    public get baseURL(): string {
        return this._baseURL;
    }
}

export const API_CONFIG = ApiConfig.getInstance();
export default API_CONFIG;