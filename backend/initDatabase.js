const mysql = require('mysql2/promise');
require('dotenv').config();

const parseDatabaseUrl = (databaseUrl) => {
    const normalized = databaseUrl.replace(/^mysql\+pymysql:/, 'mysql:');
    return new URL(normalized);
};

const getDbConfig = () => {
    if (process.env.DATABASE_URL) {
        const url = parseDatabaseUrl(process.env.DATABASE_URL);
        return {
            host: url.hostname,
            user: url.username,
            password: url.password,
            database: url.pathname.replace(/^\//, ''),
            port: url.port ? Number(url.port) : 3306,
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        port: Number(process.env.DB_PORT) || 3306,
    };
};

const getBaseConfig = (config) => ({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
});

(async () => {
    try {
        const config = getDbConfig();
        const baseConfig = getBaseConfig(config);
        const dbName = config.database;

        if (!dbName) {
            throw new Error('Database name is missing in .env (DB_NAME or DATABASE_URL).');
        }

        const connection = await mysql.createConnection(baseConfig);
        const safeDbName = `\`${dbName.replace(/`/g, '``')}\```;
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${ safeDbName } CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; `);
    await connection.end();

    console.log(`✅ Database created or already exists: ${ dbName } `);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    process.exit(1);
  }
})();
