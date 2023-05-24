import express from "express";
import { registerUser } from "./User/UserController";

const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON data in the request body

app.post("/register", registerUser);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
