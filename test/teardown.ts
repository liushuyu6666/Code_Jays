export default async (): Promise<void> => {
    console.log('shutting down in memory Mongodb');
    const { __MONGOD__: server } = global as any;
    await Promise.all([server.stop()]);
};
