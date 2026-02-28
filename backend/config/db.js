const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'abbassi32304',
  database: process.env.DB_NAME || 'alburhan_classroom'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Also export the promise wrapper for async/await support
const promiseConnection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'abbassi32304',
  database: process.env.DB_NAME || 'alburhan_classroom'
}).promise();

// Add promise method to the callback connection
connection.promise = () => promiseConnection;

module.exports = connection;
