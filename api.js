const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mysql = require('mysql2');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const databaseName = 'sql12788624';
const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    user: 'sql12788624',
    password: '6BiqxuRBK7',
    database: databaseName
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});
app.get('/', (req, res) => {
    res.send('API is working');
});

app.get('/discussions', (req, res) => {
    db.query('SELECT * FROM discussions ORDER BY id desc', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/comments/:discussionId', (req, res) => {
    db.query('SELECT * FROM comments WHERE discussionId = ?', [req.params.discussionId], (err, results) => {
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

app.post('/comments', (req, res) => {
    const { discussionId, text, author } = req.body;
    db.query('INSERT INTO comments (discussionId, text, author) VALUES (?, ?, ?)', [discussionId, text, author], (err, result) => {
        if (err) {
            console.error('Error inserting comment:', err);
            return res.status(500).json(err);
        }
        res.status(201).json({ message: 'Comment added successfully', commentId: result.insertId });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}... awaiting MySQL connection`);
});
