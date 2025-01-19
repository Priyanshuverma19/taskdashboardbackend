import mysql from 'mysql2/promise';


const pool = mysql.createPool({
  host: process.env.VITE_DB_HOST,
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  database: process.env.VITE_DB_NAME,
  waitForConnections: true,  
  connectionLimit: 10,      
  queueLimit: 0            
});


(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the database using the connection pool.');
    connection.release(); 
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();

export default pool;
