#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes all SQL migration files in order
 * Usage: node runMigrations.js
 */

const { getPool } = require('./config/db');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'migrations');

const runMigrations = async () => {
    try {
        const pool = await getPool();

        // Get all .sql files in migrations folder
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('✅ No migrations to run');
            process.exit(0);
        }

        console.log(`\n📊 Running ${files.length} migration(s)...\n`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            try {
                console.log(`⏳ Running migration: ${file}`);

                // Split by semicolon and filter empty statements
                const statements = sql.split(';').filter(stmt => stmt.trim());

                for (const statement of statements) {
                    if (statement.trim()) {
                        await pool.query(statement);
                    }
                }

                console.log(`✅ Completed: ${file}\n`);
            } catch (error) {
                console.error(`❌ Error in migration ${file}:`, error.message);
                throw error;
            }
        }

        console.log('✅ All migrations completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

// Run migrations
runMigrations();
