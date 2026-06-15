import bcrypt from 'bcrypt';
import pool from "../database/index.contentDB.js"
import jwt from "jsonwebtoken"
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

export const getBlogs = async (req, res) => {
   try {
     const [blogs] = await pool.query(
       `SELECT id, title, body,author_name, date,created_at
        FROM blogs
        ORDER BY created_at DESC`
     );
 
     return res.status(200).json({ data: blogs });
 
   } catch (err) {
     console.error("getBlogs error:", err);
     return res.status(500).json({ message: "Internal server error" });
   }
};

export const getSingleBlog = async (req, res) => {
   try {
   console.log(req.params.id)
    const {id} = req.params
    console.log(id)
     const [blogs] = await pool.query(
       `SELECT id, title, body,author_name, date,created_at
        FROM blogs
        WHERE id = ?`,[id]
     );
     if(blogs.length === 0){
      return res.status(404).json({message:"blog not found"})
     }
     
     return res.status(200).json({ data: blogs[0] });
   } catch (err) {
     console.error("getBlogs error:", err);
     return res.status(500).json({ message: "Internal server error" });
   }
};

export const registerUser = async (req, res) => {
  try {
   console.log(req.body)
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [rows] = await pool.query(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO user (username, email, password) VALUES (?, ?, ?)',
      [name, email, hashed_password]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
   try {
     const { email, password } = req.body;
 
     if (!email || !password) {
       return res.status(400).json({ message: 'Email and password are required' });
     }

     const [rows] = await pool.query(
       'SELECT * FROM `user` WHERE email = ?',
       [email]
     );
 
     if (rows.length === 0) {
       return res.status(404).json({ message: 'User not found' });
     }
 
     const user = rows[0];

     const isMatch = await bcrypt.compare(password, user.password);
 
     if (!isMatch) {
       return res.status(401).json({ message: 'Invalid credentials' });
     }

     const token = jwt.sign(
      { id: user.id, name: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
     
    res.cookie('token', token, {
      httpOnly: true,      
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

     return res.status(200).json({
      message: 'Login successful',
      user: {
         name: user.username,
         role:user.role
     },
     });
 
   } catch (err) {
     console.error('Login error:', err);
     return res.status(500).json({ message: err.message });
   }
 };

 export const addBlog = async (req, res) => {
  let image;
  try {
    const { title, body, author_name, date } = req.body;

    if (!title || !body || !author_name || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imageLocalPath = req.file?.path;

    if (imageLocalPath) {
      try {
        image = await uploadOnCloudinary(imageLocalPath);
      } catch (error) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO blogs (title, body, author_name, date, image_url, image_public_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, body, author_name, date, image?.url || null, image?.public_id || null]
    );

    return res.status(201).json({ message: "Blog created", id: result.insertId });
  } catch (err) {
    console.error("addBlog error:", err);
    if (image) {
      await deleteFromCloudinary(image.public_id);
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  })
  return res.status(200).json({ message: 'Logged out' })
}

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params

    const [blog] = await pool.query(
      'SELECT id FROM blogs WHERE id = ?', [id]
    )

    if (blog.length === 0) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    await pool.query('DELETE FROM blogs WHERE id = ?', [id])

    return res.status(200).json({ message: 'Blog deleted successfully' })

  } catch (err) {
    console.error('deleteBlog error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, author_name, date } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    if (!title || !body || !author_name || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [result] = await pool.query(
      `UPDATE blogs 
       SET title = ?, body = ?, author_name = ?, date = ?
       WHERE id = ?`,
      [title, body, author_name, date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

  return res.status(200).json({
      message: "Blog updated successfully",
  });
  } catch (err) {
    console.error("updateBlog error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};