const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'securevote_user',
  password: 'securevote_password123',
  database: 'securevote'
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database as id ' + connection.threadId);
});

connection.end();