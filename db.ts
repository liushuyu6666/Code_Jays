import mongoose, { createConnection } from "mongoose";
import mysql, { Connection } from "mysql";

export async function connectToMongodb() {
  // TODO: move to .env
  const MONGO_URI = "mongodb://127.0.0.1:27017/CodeJays";

  mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB.");
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
    });
}

// TODO: maybe we can make it a higher order function and close the connection at the end
export const mysqlConnection: Connection = mysql.createConnection({
    host: "localhost",
    user: "codejays",
    password: "password",
    database: "codejays",
});

export async function connectToMysql() {
    mysqlConnection.connect((err) => {
        if (err) {
        // TODO: logger please
            console.error("Error connecting to MySQL database:", err);
            return;
        }
        console.log("Connected to MySQL database.");
    });

    // TODO: close mysql connection
}
