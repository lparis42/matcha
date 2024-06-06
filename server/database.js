const pgp = require('pg-promise')();

class Database {
    constructor(user, host, database, password, port) {
        this.pgp = pgp({
            user: user,
            host: host,
            database: database,
            password: password,
            port: port,
        });
    }

    async connect() {
        try {
            await this.pgp.connect();
            console.log(`Database - Connected to the database '${this.pgp.$cn.database}'`);
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    create(table, columns) {
        const columnsFormatted = columns.join(', ');
        const query = `CREATE TABLE IF NOT EXISTS ${table} (${columnsFormatted});`;
        return query;
    }

    drop(table) {
        const query = `DROP TABLE IF EXISTS ${table};`;
        return query;
    }

    insert(table, row, returning = '') {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(value => this.pgp.as.value(value)).join(', ');
        const query = `INSERT INTO ${table} (${columns}) VALUES (${values}) ${returning};`;
        return query;
    }

    delete(table, condition) {
        const query = `DELETE FROM ${table} WHERE ${condition};`;
        return query;
    }

    select(table, columns, condition) {
        const columnsFormatted = columns.join(', ');
        const query = `SELECT ${columnsFormatted} FROM ${table} WHERE ${condition};`;
        return query;
    }

    update(table, values, condition) {
        const updates = Object.keys(values)
            .map(key => `${key}=${this.pgp.as.value(values[key])}`)
            .join(', ');
        const query = `UPDATE ${table} SET ${updates} WHERE ${condition};`;
        return query;
    }

    upsert(table, values, conflictTarget) {
        const columns = Object.keys(values).join(', ');
        const valuesFormatted = Object.values(values).map(value => this.pgp.as.value(value)).join(', ');
        const updates = Object.keys(values)
            .map(column => `${column}=EXCLUDED.${column}`)
            .join(', ');
        const query = `INSERT INTO ${table} (${columns}) VALUES (${valuesFormatted}) ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updates};`;
        return query;
    }

    insert_where_not_exists(table, row, condition) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(value => this.pgp.as.value(value)).join(', ');
        const query = `
            INSERT INTO ${table} (${columns})
            SELECT ${values}
            WHERE NOT EXISTS (
                ${condition}
            )
            RETURNING 1;`;
        return query;
    }

    async execute(query) {
        try {
            const data = await this.pgp.any(query);
            return data;
        } catch (err) {
            throw `Database - ${err.message} : \n ${query}`;
        }
    }
}

module.exports = Database;
