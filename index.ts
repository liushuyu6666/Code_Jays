import express from 'express';
import { UserController } from './src/User/UserController';
import { mongodbOperation, mysqlOperation } from './db';
import { DatabaseType } from './src/User/UserRepository';
import { ImageController } from './src/Image/ImageController';
import * as aws from './aws';
import multer from 'multer';

const app = express();
const port = 3000;
// TODO: in .env
const databaseType = DatabaseType.MongoDB;

// const upload = multer({ dest: 'uploads/' }) load files to the uploads folder.
const upload = multer({});

app.use(express.json()); // To parse JSON data in the request body

// TODO: mongodbOperation / mysqlOperation should be have a high level description
const userController = new UserController(databaseType, mongodbOperation());
const imageController = new ImageController(
    databaseType,
    mongodbOperation(),
    aws.s3Client,
    'jays',
);

app.post('/register', userController.registerUser.bind(userController));
app.post('/login', userController.loginUser.bind(userController));
app.post('/images', upload.single('imageContent'), imageController.uploadImageToS3.bind(imageController));
app.get('/images', imageController.listImages.bind(imageController));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
