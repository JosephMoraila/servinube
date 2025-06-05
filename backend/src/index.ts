import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import registerRouter from "./routes/auth";
import validateRouter from "./routes/validate";
import loginRouter from "./routes/login";
import logoutRouter from "./routes/logout";
import upload from "./routes/upload";
import downloadFile from "./routes/downloadFile";
import changePassword from "./routes/changePassword";
import deleteAccount from "./routes/deleteAccount";
import previewFileRouter from './routes/previewFile';
import deleteFile from './routes/deleteFile';
import deleteFolder from "./routes/deleteFolder";
import restoreFileRouter from './routes/restoreFile';
import listTrashRouter from './routes/listTrash';
import permanentDeleteRouter from './routes/permanentDelete';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

// Obtener direcciones IP locales dinámicamente
const getLocalIPs = () => {
    const interfaces = require("os").networkInterfaces();
    const addresses: string[] = [];

    // Aquí agregamos la declaración de tipo para `interfaces` y `address`
    Object.values(interfaces).forEach((iface: any) => {
        iface?.forEach((address: { family: string, internal: boolean, address: string }) => {
            if (address.family === "IPv4" && !address.internal) {
                addresses.push(`http://${address.address}:${5173}`);
            }
        });
    });

    // Agregar localhost de manera predeterminada
    addresses.push(`http://localhost:${5173}`);
    console.log("Direcciones IP locales:", addresses);
    return addresses;
};

// Configuración de CORS dinámica
app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
        const allowedOrigins = getLocalIPs();  // Obtener IPs locales dinámicamente
        
        // Verifica si el origen de la solicitud está en las IPs locales
        if (allowedOrigins.includes(origin || "")) {
            callback(null, true);  // Permite la solicitud
        } else {
            callback(new Error("Origen no permitido"), false);  // Rechaza la solicitud
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"],  // Encabezados permitidos
    credentials: true  // Si estás usando cookies o autenticación
}));

// Middleware para manejar JSON y cookies
app.use(cookieParser());
app.use(express.json());

// Configurar carpeta de uploads como estática
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Ruta de prueba
app.get("/", (req: Request, res: Response) => {
    res.send("Servidor en funcionamiento");
});

// Rutas de autenticación
app.use("/api", registerRouter);
app.use("/api", validateRouter);
app.use("/api", loginRouter);
app.use("/api", logoutRouter);
app.use("/api", upload);
app.use("/api", downloadFile);
app.use("/api", changePassword);
app.use("/api", deleteAccount);
app.use("/api", previewFileRouter);
app.use("/api", deleteFile);
app.use("/api", deleteFolder);
app.use("/api", restoreFileRouter);
app.use("/api", listTrashRouter);
app.use("/api", permanentDeleteRouter);

// Middleware de manejo de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Algo salió mal en el servidor." });
});

// Iniciar el servidor
app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor corriendo en:`);

    // Mostrar las direcciones IP locales obtenidas dinámicamente
    const localIPs = getLocalIPs();
    localIPs.forEach((ip) => {
        console.log(`- Red local: ${ip}`);
    });
});
