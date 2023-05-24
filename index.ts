import express, { NextFunction, Request, Response } from "express";
import { createContext } from "./context";

const app = express();
const port = 3000;

app.use(createContext);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
