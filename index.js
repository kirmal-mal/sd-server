const express = require('express')
const path = require('path')
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

express()
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/test_logs', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM env_logs');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/test_logs.ejs', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/envdata', async (req, res) => {
    var post_body = req.body;
    try {
      var queryString = `INSERT INTO env_logs(env_data) VALUES(\'${post_body.data}\')`;
      console.log(queryString);
      const client = await pool.connect();
      const result = await client.query(queryString);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
    res.send(post_body.data + ' inserted\n');
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

