import mongoose, { Schema } from "mongoose";

export class User {
  public userId: string;
  public username: string;
  public password: string;
  public email: string;

  constructor(
    userId: string,
    username: string,
    hashedPassword: string,
    email: string
  ) {
    this.userId = userId;
    this.email = email;
    this.username = username;
    this.password = hashedPassword;
  }
}

const userSchema = new Schema<User>(
  {
    userId: String,
    username: String,
    password: String,
    email: String,
  },
  {
    versionKey: false, // No `__v` field in mongodb
    collection: 'User'
  }
);

// Mongoose automatically looks for the plural version of your model name.
// So, the collection will be 'users', not 'user'.
// If you don't like this behavior, goto https://mongoosejs.com/docs/api/mongoose.html#example-1
export const UserModel = mongoose.model<User>("User", userSchema);
