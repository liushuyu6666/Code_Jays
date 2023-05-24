import express from "express";
import { UserController } from "./User/UserController";

const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON data in the request body

app.post("/register", UserController.registerUser);
app.post("/login", UserController.loginUser);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
