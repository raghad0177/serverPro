const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg');
require('dotenv').config();

// Setup database connection
const url = process.env.URL;
const port = process.env.PORT;
const client = new Client(url);

// Create Express app
const app = express();

// Middleware configurations
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Allow requests only from specified origins
const allowedOrigins = ['https://masar2024.netlify.app/', 'http://localhost:3000','https://main--masar2024.netlify.app/'];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Routes and handlers

// Get all cats
app.get('/', async (req, res) => {
    try {
        const sql = `SELECT * FROM cats`;
        const result = await client.query(sql);
        const data = result.rows;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a cat
app.post('/addCat', async (req, res) => {
    try {
        const { name, origin, temperament, age, color, image, gender, phone } = req.body;
        const sql = `INSERT INTO cats (name, origin, temperament, age, color, image, gender, phone) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        const values = [name, origin, temperament, age, color, image, gender, phone];
        const result = await client.query(sql, values);
        res.status(201).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 Not Found middleware
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
});

// Connect to database and start the server
client.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error);
    });
