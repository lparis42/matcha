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
        let query;
        if (columns && columns.length > 0) {
            const columnsFormatted = columns.join(', ');
            query = `CREATE TABLE IF NOT EXISTS ${table} (${columnsFormatted});`;
        } else {
            query = `CREATE TABLE IF NOT EXISTS ${table} ();`;
        }
        return query;
    }

    drop(table) {
        const query = `DROP TABLE IF EXISTS ${table};`;
        return query;
    }

    insert(table, row, returning = '') {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(value => this.preventInjection(value)).join(', ');
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

    update(table, values, condition, option = '') {
        if (option === 'ADD') {
            const updates = Object.keys(values).map(key => `${key}=${key}+${this.preventInjection(values[key])}`).join(', ');
            const query = `UPDATE ${table} SET ${updates} WHERE ${condition};`;
            return query;
        }
        if (option === 'SUBTRACT') {
            const updates = Object.keys(values).map(key => `${key}=${key}-${this.preventInjection(values[key])}`).join(', ');
            const query = `UPDATE ${table} SET ${updates} WHERE ${condition};`;
            return query;
        }
        if (option === 'ARRAY_APPEND') {
            const updates = Object.keys(values).map(key => `${key}=ARRAY_APPEND(${key}, ${this.preventInjection(values[key])})`).join(', ');
            const query = `UPDATE ${table} SET ${updates} WHERE ${condition};`;
            return query;
        }
        if (option === 'ARRAY_REMOVE') {
            const updates = Object.keys(values).map(key => `${key}=ARRAY_REMOVE(${key}, ${this.preventInjection(values[key])})`).join(', ');
            const query = `UPDATE ${table} SET ${updates} WHERE ${condition};`;
            return query;
        }
        const updates = Object.keys(values).map(key => `${key}=${this.preventInjection(values[key])}`).join(', ');
        const query = `UPDATE ${table} SET ${updates} WHERE ${condition};`;
        return query;
    }

    upsert(table, values, conflictTarget, returning = '') {
        const columns = Object.keys(values).join(', ');
        const valuesFormatted = Object.values(values).map(value => this.preventInjection(value)).join(', ');
        const updates = Object.keys(values).map(column => `${column}=EXCLUDED.${column}`).join(', ');
        const query = `INSERT INTO ${table} (${columns}) VALUES (${valuesFormatted}) ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updates} ${returning};`;
        return query;
    }

    insert_where_not_exists(table, row, condition) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(value => this.preventInjection(value)).join(', ');
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

    // *** Helper functions *** //

    preventInjection(value) {
        if (value === null || value === undefined || (typeof value === 'object' && value.length === 0)) {
            return 'NULL';
        }
        if (typeof value !== 'string' && typeof value === 'object') {
            const formattedObject = Object.entries(value).map(([key, value]) => `${this.preventInjection(value)}`).join(',');
            return `ARRAY[${formattedObject}]`;
        }
        const formatted_value = pgp.as.value(value);
        return typeof value === 'string' ? `'${formatted_value}'` : formatted_value;
    }
}

module.exports = Database;