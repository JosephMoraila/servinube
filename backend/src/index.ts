import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import registerRouter from "./routes/auth"; // Asegúrate de que la ruta sea correcta
import validateRouter from "./routes/validate"; // Asegúrate de que la ruta sea correcta
import loginRouter from "./routes/login"; // Asegúrate de que la ruta sea correcta
import logoutRouter from "./routes/logout"; // Asegúrate de que la ruta sea correcta
import upload from "./routes/upload"; // Asegúrate de que la ruta sea correcta

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Permite solicitudes solo desde tu frontend
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

// Middleware de manejo de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);  // Imprime el error en consola
    res.status(500).json({ message: "Algo salió mal en el servidor." });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
