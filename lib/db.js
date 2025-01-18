import mysql from 'mysql2/promise';


const db = await mysql.createConnection({
  host: process.env.VITE_DB_HOST,
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  database: process.env.VITE_DB_NAME,
});

console.log('Connected to the database.');

export default db;
