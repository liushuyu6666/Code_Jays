export class User {
    id: string;

    username: string;

    password: string;

    email: string;

    constructor(id: string, username: string, hashedPassword: string, email: string) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = hashedPassword;
    }
}