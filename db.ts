import mongoose from "mongoose";

export async function connectToMongodb() {
  const MONGO_URI = "mongodb://127.0.0.1:27017/CodeJays"; // Replace with your MongoDB connection string

  mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB Successfully.");
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
    });
}
