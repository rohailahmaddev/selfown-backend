import mysql from "mysql2/promise"


console.log(process.env.MYSQLHOST)
const pool = mysql.createPool({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'NUnSqRoIphhaxTMXKNUgnXKgNdovyFYz',
  database: 'railway',
  port: 3306,
  ssl: {
    rejectUnauthorized: false
  }
})

export default pool
