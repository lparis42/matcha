const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const validator = require('validator');

class Database {
    // Constructor to initialize the database
    constructor(username, host, database, password, port) {
        this.pgp = pgp({
            user: username,
            host: host,
            database: database,
            password: password,
            port: port,
        });
    }

    // Function to connect to the database
    async connect() {
        try {
            await this.pgp.connect();
            return `${this.constructor.name}: Connected to the database '${this.pgp.$cn.database}'`;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    // Function to create a table
    async create(table, columns) {
        try {
            await this.pgp.none(`CREATE TABLE IF NOT EXISTS ${table}(${columns})`);
            return `${this.constructor.name}: The table '${table}' has been created`;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    // Function to drop a table
    async drop(table) {
        try {
            await this.pgp.none(`DROP TABLE IF EXISTS ${table}`);
            return `${this.constructor.name}: The table '${table}' has been dropped`;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    // Function to insert a record in a table
    async insert(table, row) {
        try {
            row = await this.hashPasswordIfPresent(row);
            const columns = Object.keys(row);
            const insert = pgp.helpers.insert(row, columns, table);
            await this.pgp.none(insert);
            return `${this.constructor.name}: A record has been inserted in the table '${table}'`;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    // Function to delete a record from a table
    async delete(table, condition) {
        try {
            await this.pgp.none(`DELETE FROM ${table} WHERE ${condition}`);
            return `${this.constructor.name}: A record has been successfully deleted from the table '${table}'.`;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    async select(table, columns, condition) {
        try {
            const data = await this.pgp.any(`SELECT ${columns} FROM ${table} WHERE ${condition}`);
            return data;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    // Function to update a record in a table
    async update(table, row, condition) {
        try {
            row = await this.hashPasswordIfPresent(row);
            const columns = Object.keys(row);
            const update = pgp.helpers.update(row, columns, table) + ' WHERE ' + condition;
            await this.pgp.none(update);
            return `${this.constructor.name}: A record has been updated in the table '${table}'`;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    // Function to upsert a record in a table
    async upsert(table, row, condition) {
        try {
            row = await this.hashPasswordIfPresent(row);
            const columns = Object.keys(row);
            const upsert = pgp.helpers.insert(row, columns, table) + ' ON CONFLICT (' + condition + ') DO UPDATE SET ' + pgp.helpers.sets(row, columns);
            await this.pgp.none(upsert);
            return `${this.constructor.name}: A record has been upserted in the table '${table}'`;
        } catch (err) {
            throw new Error(`${this.constructor.name}: ${err}`);
        }
    }

    // Function to hash the password if present
    async hashPasswordIfPresent(row) {
        const { password } = row;
        if (password) {
            if (!validator.isAlphanumeric(password) || !validator.isLength(password, { min: 8, max: 20 })) {
                throw new Error(`${this.constructor.name}: Password must be alphanumeric and between 8 and 20 characters`);
            } else {
                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    row.password = hashedPassword;
                    return row;
                } catch (err) {
                    throw new Error(`${this.constructor.name}: ${err}`);
                }
            }
        } else {
            return row;
        }
    }
}

module.exports = Database;