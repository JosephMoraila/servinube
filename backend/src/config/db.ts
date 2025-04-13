import { Pool, Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

// Conectar a PostgreSQL sin especificar la base de datos para crearla si no existe
const client = new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
    database: "postgres", // Nos conectamos a "postgres" para poder crear la base de datos si no existe
});

// Crear el pool de conexión globalmente
const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
});

async function initializeDatabase() {
    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);

        if (res.rowCount === 0) {
            console.log(`⚠️ La base de datos "${DB_NAME}" no existe. Creándola...`);
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`✅ Base de datos "${DB_NAME}" creada exitosamente.`);
        } else {
            console.log(`✅ La base de datos "${DB_NAME}" ya existe.`);
        }
    } catch (error) {
        console.error("❌ Error al verificar/crear la base de datos:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function initializeTables() {
    try {
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename = 'usuarios'
            );
        `);

        if (!tableExists.rows[0].exists) {
            console.log("⚠️ Tabla 'usuarios' no existe. Creándola...");
            
            await pool.query(`
                CREATE TABLE usuarios (
                    id SERIAL PRIMARY KEY,
                    nombre_publico VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL
                );
            `);
            
            console.log("✅ Tabla 'usuarios' creada exitosamente");
        } else {
            console.log("✅ Tabla 'usuarios' ya existe");
        }
    } catch (error) {
        console.error("❌ Error al inicializar las tablas:", error);
        throw error;
    }
}

// Ejecutar la inicialización de la base de datos y las tablas
initializeDatabase()
    .then(async () => {
        console.log("🔄 Base de datos lista.");
        await initializeTables();
        console.log("✅ Inicialización completa.");
    })
    .catch(error => {
        console.error("❌ Error en la inicialización:", error);
        process.exit(1);
    });

export { pool };
