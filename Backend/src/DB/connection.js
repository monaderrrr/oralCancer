import mongoose from "mongoose";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const database_connection = async () => {
    let uri = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
    const maxAttempts = 5;
    let attempt = 0;

    if (!uri) {
        console.warn("MONGO_URI or MONGODB_URI is not set in environment — will attempt localhost and in-memory fallback");
        uri = "mongodb://localhost:27017/oral";
    }

    while (attempt < maxAttempts) {
        attempt += 1;
        try {
            await mongoose.connect(uri);
            console.log("Database connected Successfully to MongoDB Atlas");
            return true;
        } catch (error) {
            const waitMs = 1000 * Math.pow(2, attempt - 1); // exponential backoff
            console.error(
                `Attempt ${attempt} to connect to MongoDB (${uri}) failed. Retrying in ${waitMs}ms...`,
                error.message || error
            );
            if (attempt < maxAttempts) await sleep(waitMs);
        }
    }

    console.error(`Could not connect to MongoDB after ${maxAttempts} attempts.`);
    // Try in-memory fallback for development convenience (dynamic import)
    try {
        console.log("Starting in-memory MongoDB (mongodb-memory-server) as a development fallback...");
        const mod = await import('mongodb-memory-server');
        const MongoMemoryServer = mod.MongoMemoryServer || mod.default?.MongoMemoryServer || mod.default;
        if (!MongoMemoryServer || typeof MongoMemoryServer.create !== 'function') {
            throw new Error('mongodb-memory-server module does not expose MongoMemoryServer');
        }
        const mongod = await MongoMemoryServer.create({ instance: { dbName: "oral" } });
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log("Connected to in-memory MongoDB at", memUri);
        return true;
    } catch (memErr) {
        console.error("In-memory MongoDB fallback failed (module may be missing):", memErr.message || memErr);
        console.error("To enable an in-memory fallback install the package:");
        console.error("  npm install mongodb-memory-server --save-dev");
    }

    return false;
};
