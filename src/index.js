import dotenv from "dotenv";

dotenv.config({
    path:"./.env"
})

import app from "./app.js";
import { Scheme } from "./model/index.model.js";



//database connection

Scheme()


const PORT = process.env.PORT || 8080

app.listen(PORT)