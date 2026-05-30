const mysql = require('mysql2/promise');
require('dotenv').config();

const parseDatabaseUrl = (databaseUrl) => {
    try {
        const dbUrl = new URL(databaseUrl.replace(/^mysql\+pymysql:/, 'mysql:'));
        return {
            host: dbUrl.hostname,
            user: dbUrl.username,
            password: dbUrl.password,
            database: dbUrl.pathname.replace(/^\//, ''),
            port: dbUrl.port ? Number(dbUrl.port) : 3306,
        };
    } catch (err) {
        console.error('❌ Invalid DATABASE_URL:', err.message);
        return null;
    }
};

const getDbConfig = () => {
    if (process.env.DATABASE_URL) {
        const urlConfig = parseDatabaseUrl(process.env.DATABASE_URL);
        if (urlConfig) return urlConfig;
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        port: Number(process.env.DB_PORT) || 3306,
    };
};

const config = getDbConfig();

const ensureDatabaseExists = async () => {
    if (!config.database) {
        throw new Error('Database name is missing in .env (DB_NAME or DATABASE_URL).');
    }

    const baseConfig = {
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
    };

    const connection = await mysql.createConnection(baseConfig);
    const safeDbName = `\`${config.database.replace(/`/g, '``')}\``;
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${safeDbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
};

let poolInstance = null;
let poolPromise = null;

const initializePool = async () => {
    if (poolPromise) return poolPromise;

    poolPromise = (async () => {
        try {
            await ensureDatabaseExists();
            poolInstance = mysql.createPool({
                ...config,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
            });

            const connection = await poolInstance.getConnection();
            console.log('✅ MySQL Database connected successfully!');
            connection.release();
            return poolInstance;
        } catch (error) {
            console.error('❌ Database connection error:', error.message);
            poolPromise = null; // Reset so it can retry
            throw error;
        }
    })();

    return poolPromise;
};

const getPool = async () => {
    if (poolInstance) {
        return poolInstance;
    }

    try {
        await initializePool();
        if (!poolInstance) {
            throw new Error('Pool initialization failed - pool is still null');
        }
        return poolInstance;
    } catch (error) {
        console.error('❌ Error getting database pool:', error.message);
        throw error;
    }
};

module.exports = {
    getPool,
    config,
    initializePool,
};
