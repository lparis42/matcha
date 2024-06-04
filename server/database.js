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
            console.log(`Database - Connected to the database '${this.pgp.$cn.database}'`) + ';\n';
        } catch (err) {
            throw `Database - ${err.message}`;
        }
    }

    create(table, columns) {
        return pgp.as.format('CREATE TABLE IF NOT EXISTS $1:name ($2:raw)', [table, columns.join(', ')]) + ';\n';
    }

    drop(table) {
        return pgp.as.format('DROP TABLE IF EXISTS $1:name', table) + ';\n';
    }

    insert(table, row, returning = '') {
        const columns = Object.keys(row);
        return pgp.helpers.insert(row, columns, table) + returning + ';\n';
    }

    delete(table, condition) {
        return pgp.as.format('DELETE FROM $1:name WHERE $2:raw', [table, condition]) + ';\n';
    }

    select(table, columns, condition) {
        return pgp.as.format('SELECT $1:name FROM $2:name WHERE $3:raw', [columns, table, condition]) + ';\n';
    }

    update(table, values, condition) {
        const columns = Object.keys(values);
        return pgp.helpers.update(values, columns, table) + ' WHERE ' + condition + ';\n';
    }

    upsert(table, values, conflictTarget) {
        const columns = Object.keys(values);
        const insert = pgp.helpers.insert(values, columns, table);
        const updates = Object.keys(values).map(column => `${column}=EXCLUDED.${column}`).join(", ");
        return `${insert}` + pgp.as.format(` ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updates}`) + ';\n';
    }

    insert_where_not_exists(table, row, condition) { 
        const query = `
            INSERT INTO $1:name ($2:name)
            SELECT $2:csv
            WHERE NOT EXISTS (
                $3:raw
            )
            RETURNING 1`;
    
        return pgp.as.format(query, [table, row, condition]) + ';\n';
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