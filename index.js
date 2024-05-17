const express = require('express');
const app = express();
const cors =require('cors')
const bodyParser = require('body-parser');
const { Client } = require('pg');
require('dotenv').config();

// Setup database connection
const url = process.env.URL;
const port = process.env.PORT;
const client = new Client(url);


// Middleware configurations
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// get and post methods 
app.post('/addCat', addCatsHandler);
app.get('/', getCatsHandler);

// get all Cats from 
function getCatsHandler(req, res) {
    const sql = `SELECT * FROM cats`;
    client.query(sql).then((result) => {
        const data = result.rows;
        res.json(data);
        console.log(data);
    }).catch();
}

// add cat to DB
function addCatsHandler(req, res) {
    const { name, origin, temperament, age, color, overview,image,gender} = req.body;
    const sql = `INSERT INTO cats (name, origin, temperament, age, color, overview,image,gender) 
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING * ;`
    const values = [name, origin, temperament, age, color, overview,image,gender];
    client.query(sql, values).then((result) => {
        console.log(result.rows);
        res.status(201).json(result.rows)
    }).catch();
}






//error handling (server)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        responseText: "Sorry, something went wrong"
    });
});
//error handling (404)
app.use((req, res, next) => {
    
    res.status(404).json({
        status: 404,
        responseText: "Page not found"
    });
});

//connect to db then make listining 
client.connect().then(() => {
    app.listen(port, () => {
        console.log("http://localhost:" + `${port}`);
    })
}
).catch(); 