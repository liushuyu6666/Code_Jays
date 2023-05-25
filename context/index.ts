// import { MongoClient, Db } from "mongodb";
// import * as httpContext from 'express-http-context';

// // TODO: move to .env
// const MONGO_URI = "mongodb://127.0.0.1:27017/CodeJays"

// const dbOperation = (mongoUri: string) => {
//     return async (callback: (db: Db) => Promise<void>) => {
//         const client = await MongoClient.connect(mongoUri);
//         const db = client.db();
//         try {
//             return await callback(db);
//         } finally {
//             client.close();
//         }
//     }
// }

// export const createContext = () => {
//     httpContext.set('dbOps', dbOperation(MONGO_URI));
//     httpContext.set('userId', '');
//     console.log(httpContext.get('dbOps'));
// }