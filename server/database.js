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
    create(table, columns) {
        return pgp.as.format('CREATE TABLE IF NOT EXISTS $1:name ($2:raw)', [table, columns.join(', ')]);
    }

    // To drop a table
    drop(table) {
        return pgp.as.format('DROP TABLE IF EXISTS $1:name', table);
    }

    // To insert a record in a table
    insert(table, row) {
        const columns = Object.keys(row);
        return pgp.helpers.insert(row, columns, table);
    }

    // To delete a record from a table
    delete(table, condition) {
        return pgp.as.format('DELETE FROM $1:name WHERE $2:raw', [table, condition]);
    }

    // To select records from a table
    select(table, columns, condition) {
        return pgp.as.format('SELECT $1:name FROM $2:name WHERE $3:raw', [columns, table, condition]);
    }

    // To update a record in a table
    update(table, columns, values, condition) {
        return pgp.helpers.update(values, columns, table) + ' WHERE ' + condition;
    }

    insert_where_not_exists(table, row, condition) { 
        const query = `
            INSERT INTO $1:name ($2:name)
            SELECT $2:csv
            WHERE NOT EXISTS (
                $3:raw
            )
            RETURNING 1
        `;
    
        return pgp.as.format(query, [table, row, condition]);
    }
    

    async execute(query) {
        try {
            const data = await this.pgp.any(query);
            return data;
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }
}

module.exports = Database;