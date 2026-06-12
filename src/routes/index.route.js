import {Router} from "express"
import { addBlog, deleteBlog, getBlogs, getSingleBlog, loginUser, logoutUser, registerUser, updateBlog } from "../controller/index.controllers.js";
import {verifyAdmin, verifyToken} from "../middleware/auth.middleware.js"
import upload from "../middleware/multer.middleware.js";

const router = Router();


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/blogs").get(getBlogs)
router.route("/blogs/:id").get(getSingleBlog)
router.route("/logout").post(logoutUser)

//protect route

router.route("/me").get(verifyToken,(req, res) => { res.json({ id: req.user.id, name: req.user.name, role: req.user.role })})
router.route("/add-blogs").post(
    verifyAdmin,
    upload.single("image"),
    addBlog
  );
router.route("/blogs/:id").delete(verifyAdmin, deleteBlog)
router.route("/update-blog/:id").put(
    verifyAdmin,
    upload.single("image"),
    updateBlog
  );

export default router