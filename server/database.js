const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const validator = require('validator');

class Database {

    // Constructor to initialize the database
    constructor(user, host, database, password, port) {
        this.pgp = pgp({
            user: user,
            host: host,
            database: database,
            password: password,
            port: port,
        });
    }

    // To connect to the database
    async connect() {
        try {
            await this.pgp.connect();
            console.log(`Database - Connected to the database '${this.pgp.$cn.database}'`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To disconnect from the database
    async create(table, columns) {
        try {
            await this.pgp.none(`CREATE TABLE IF NOT EXISTS ${table}(${columns})`);
            console.log(`Database - The table '${table}' has been created`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To drop a table
    async drop(table) {
        try {
            await this.pgp.none(`DROP TABLE IF EXISTS ${table}`);
            console.log(`Database - The table '${table}' has been dropped`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To insert a record in a table
    async insert(table, row) {
        try {
            await this.hashPasswordIfPresent(row);
            const columns = Object.keys(row);
            const insert = pgp.helpers.insert(row, columns, table);
            await this.pgp.none(insert);
            console.log(`Database - A record has been inserted in the table '${table}'`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To delete a record from a table
    async delete(table, condition) {
        try {
            await this.pgp.none(`DELETE FROM ${table} WHERE ${condition}`);
            console.log(`Database - A record has been successfully deleted from the table '${table}'.`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To select records from a table
    async select(table, columns, condition) {
        try {
            const data = await this.pgp.any(`SELECT ${columns} FROM ${table} WHERE ${condition}`);
            return data;
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To update a record in a table
    async update(table, row, condition) {
        try {
            await this.hashPasswordIfPresent(row);
            const columns = Object.keys(row);
            const update = pgp.helpers.update(row, columns, table) + ' WHERE ' + condition;
            await this.pgp.none(update);
            console.log(`Database - A record has been updated in the table '${table}'`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To upsert a record in a table
    async upsert(table, row, condition) {
        try {
            await this.hashPasswordIfPresent(row);
            const columns = Object.keys(row);
            const upsert = pgp.helpers.insert(row, columns, table) + ' ON CONFLICT (' + condition + ') DO UPDATE SET ' + pgp.helpers.sets(row, columns);
            await this.pgp.none(upsert);
            console.log(`Database - A record has been upserted in the table '${table}'`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    // To hash the password if present
    async hashPasswordIfPresent(row) {
        try {
            const { password } = row;
            if (password) {
                if (!validator.isAlphanumeric(password) || !validator.isLength(password, { min: 8, max: 20 })) {
                    throw new Error(`The password must be alphanumeric and between 8 and 20 characters`);
                } else {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    row.password = hashedPassword;
                }
            }
        } catch (err) {
            ;
            throw err;
        }
    }
}

module.exports = Database;