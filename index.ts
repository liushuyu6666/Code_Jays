import express from "express";
import { UserController } from "./src/User/UserController";
import { mysqlOperation, mongodbOperation } from "./db";
import { DatabaseType } from "./src/User/UserRepository";

const app = express();
const port = 3000;
// TODO: in .env
const databaseType = DatabaseType.MySQL;

app.use(express.json()); // To parse JSON data in the request body

const userController = new UserController(databaseType, mysqlOperation())

app.post("/register", userController.registerUser.bind(userController));
app.post("/login", userController.loginUser.bind(userController));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
