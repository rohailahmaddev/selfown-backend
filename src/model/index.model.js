import pool from "../database/index.contentDB.js"

export const Scheme = async() => {

    try {
        await pool.query(
            `
            CREATE TABLE IF NOT EXISTS \`user\`(
              id INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(150) NOT NULL,
              email VARCHAR(100) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              role ENUM('user','admin') DEFAULT 'user',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `
        )
        await pool.query(
            `
           CREATE TABLE IF NOT EXISTS blogs (
           id INT AUTO_INCREMENT PRIMARY KEY,
           title VARCHAR(255) NOT NULL,
           author_name VARCHAR(255) NOT NULL,
           body TEXT NOT NULL,
           image_url VARCHAR(500),
           image_public_id VARCHAR(255),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
            `
        )

    } catch (error) {
        throw Error(error)
    }

}