export class User {
    public userId: string;
    public username: string;
    public password: string;
    public email: string;

    constructor(
        userId: string,
        username: string,
        hashedPassword: string,
        email: string,
    ) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.password = hashedPassword;
    }
}
