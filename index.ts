import express from "express";
import { UserController } from "./src/User/UserController";
import { connectToMongodb, connectToMysql, mysqlConnection } from "./db";
import { DatabaseType } from "./src/User/UserRepository";

const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON data in the request body
const userController = new UserController(DatabaseType.MySQL, mysqlConnection)

app.post("/register", userController.registerUser.bind(userController));
app.post("/login", userController.loginUser.bind(userController));

Promise.all([connectToMongodb()]).then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
