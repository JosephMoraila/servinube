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
import sharedFilesRouter from './routes/sharedFiles';
import searchUsersRouter from './routes/searchUser';
import shareFileRouter from './routes/shareFile';
import unshareFileRouter from './routes/unshareFile';
import getName from './routes/getName';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

// Configuración de CORS para permitir todos los orígenes
app.use(cors({
    origin: true, // Permite cualquier origen
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true, // Necesario para cookies y autenticación
    maxAge: 86400 // Cachear los resultados del preflight por 24 horas
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
app.use("/api", sharedFilesRouter);
app.use("/api", searchUsersRouter);
app.use("/api", shareFileRouter);
app.use("/api", unshareFileRouter);
app.use("/api", getName);


// Middleware de manejo de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Algo salió mal en el servidor." });
});

// Iniciar el servidor
app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});
