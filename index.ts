import express from "express";
import { UserController } from "./src/User/UserController";
import { connectToMongodb, connectToMysql } from "./db";
import { User } from "./src/User/User";
import { UserRepository } from "./src/User/UserRepository";

const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON data in the request body

app.post("/register", UserController.registerUser);
app.post("/login", UserController.loginUser);

Promise.all([connectToMongodb(), connectToMysql()]).then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
