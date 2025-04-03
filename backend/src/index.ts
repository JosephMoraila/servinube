import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import registerRouter from "./routes/auth"; 
import validateRouter from "./routes/validate";
import loginRouter from "./routes/login";
import logoutRouter from "./routes/logout"; 
import upload from "./routes/upload";
import downloadFile from "./routes/downloadFile";
import API_CONFIG from "./utils/API_BASE_URL";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

// Configuración de CORS
app.use(cors({
    origin: API_CONFIG.baseURL || "http://localhost:5173", // Permite solicitudes desde cualquier origen
    methods: ["GET", "POST", "PUT", "DELETE"],  // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"],  // Encabezados permitidos
    credentials: true  // Si estás usando cookies o autenticación
}));

// Middleware para manejar JSON
app.use(cookieParser());
app.use(express.json());

// Ruta de prueba
app.get("/", (req: Request, res: Response) => {
    res.send("Servidor en funcionamiento");
});

// Rutas de autenticación
app.use("/api", registerRouter);  // Aquí se vincula el router de registro

app.use("/api", validateRouter);  // Aquí se vincula el router de validación

app.use("/api", loginRouter);  // Aquí se vincula el router de inicio de sesión

app.use("/api", logoutRouter);  // Aquí se vincula el router de cierre de sesión

app.use("/api", upload);  // Aquí se vincula el router de subida de archivos

app.use("/api", downloadFile);  // Aquí se vincula el router de descarga de archivos

// Middleware de manejo de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);  // Imprime el error en consola
    res.status(500).json({ message: "Algo salió mal en el servidor." });
});

// Iniciar el servidor
app.listen(port, "0.0.0.0", () => {
    const interfaces = require('os').networkInterfaces();
    const addresses = [];
    for (let k in interfaces) {
        for (let k2 in interfaces[k]) {
            let address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    console.log(`Servidor corriendo en:`);
    console.log(`- Local: http://localhost:${port}`);
    addresses.forEach(ip => {
        console.log(`- Red local: http://${ip}:${port}`);
    });
});
