const express = require('express')
const cors = require('cors')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()

const app = express()

app.use(cors())
app.use(express.json())


app.post('/api/create_db', (req, res) => {

    var schema = req.body;

    const db = new sqlite3.Database(`./${schema.db_name}.db`);
    const statements = schema.tables.map(table => {
        const columns = [`_id INTEGER PRIMARY KEY`]; // Add primary key
        for (const column of table.columns) {
            const columnName = Object.keys(column).toString().toUpperCase();
            const columnType = column[Object.values(column)];
            columns.push(`${columnName} ${columnType}`);
        }
        return `CREATE TABLE IF NOT EXISTS ${table.table_name} (${columns.join(', ')})`;
    });

    db.exec(statements.join(';'), (err) => {
        if (err) {
            console.error(`Failed to create database schema: ${err.message}`);
            return res.status(500).send(`Failed to create database schema: ${err.message}`);
        }

        db.close();

        const filePath = `./${schema.db_name}.db`;
        const fileName = `${schema.db_name}.db`;

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('close', () => {
            fs.unlinkSync(filePath);
        });
    });
})


app.listen(3000, () => {
    console.log('Api Started')
})