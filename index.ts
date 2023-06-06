import express from 'express';
import { UserController } from './src/User/UserController';
import { ImageController } from './src/Image/ImageController';
import * as aws from './aws';
import multer from 'multer';
import { DatabaseType } from './src/Database/DatabaseRepository';

const app = express();
const port = 3000;

// TODO: in launchdarkly
const databaseType = DatabaseType.MySQL;

// const upload = multer({ dest: 'uploads/' }) load files to the uploads folder.
const upload = multer({});

app.use(express.json()); // To parse JSON data in the request body

// TODO: it is better to inject MongoClient and MysqlClient or use s3Client at s3Repository.
const userController = new UserController(databaseType);
const imageController = new ImageController(
    databaseType,
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
