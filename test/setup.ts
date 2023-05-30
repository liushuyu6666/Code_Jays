import { MongoMemoryReplSet } from 'mongodb-memory-server';

const MONGO_TEST_MEMORY_INSTANCE = {
    dbName: 'jays',
    port: 34213, // no particular meaning
};

export default async (): Promise<void> => {
    console.log('starting memory Mongodb');
    const mongod = new MongoMemoryReplSet({
        instanceOpts: [MONGO_TEST_MEMORY_INSTANCE],
        replSet: { count: 1, storageEngine: 'wiredTiger' },
    });

    await mongod.start();

    // Set reference to mongod in order to close the server during teardown.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__MONGOD__ = mongod;
};
