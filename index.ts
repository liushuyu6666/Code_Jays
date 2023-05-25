import express from "express";
import { UserController } from "./User/UserController";
import { connectToMongodb } from "./db";
import { User } from "./User/User";
import { UserRepository } from "./User/UserRepository";

const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON data in the request body

app.post("/register", UserController.registerUser);
app.post("/login", UserController.loginUser);

connectToMongodb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
