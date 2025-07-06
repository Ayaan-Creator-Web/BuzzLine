
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mysql = require('mysql2');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const databaseName = 'sql12788624';
// MySQL connection
const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: 3306, // default MySQL port
    user: 'sql12788624',
    password: '6BiqxuRBK7', // update if needed
    database: databaseName
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});
// Routes
app.get('/', (req, res) => {
    res.send('API is working');
});

app.get('/discussions', (req, res) => {
    db.query('SELECT * FROM discussions ORDER BY id desc', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get one student
app.get('/comments/:discussionId', (req, res) => {
    db.query('SELECT * FROM items WHERE discussionId = ?', [req.params.discussionId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/discussions', (req, res) => {
    const { id, heading, subheading, user, date } = req.body;
    db.query('INSERT INTO discussions (id, heading, subheading, user, date) VALUES (?, ?, ?, ?, ?)', [id, heading, subheading, user, date], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'discussion created successfully', id: id });
    });
});

app.delete('/comments/:id', (req, res) => {
    db.query('DELETE FROM comments WHERE commentId = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'comment deleted' });
    });
});

// Start server
app.listen(port, () => {
    //console.log(`Server is running on http://localhost:${port}`);
    console.log(`Server is running on port ${port}... awaiting MySQL connection`);
});
//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