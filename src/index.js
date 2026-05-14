import dotenv from "dotenv";
import app from "./app.js";
import { Scheme } from "./model/index.model.js";

dotenv.config({
    path:"./.env"
})

//database connection

Scheme()


const PORT = process.env.PORT || 4500

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})