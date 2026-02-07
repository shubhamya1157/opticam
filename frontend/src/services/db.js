import { openDB } from 'idb';

const DB_NAME = 'OptiCamDB';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Task Store (Public Signals)
            if (!db.objectStoreNames.contains('tasks')) {
                db.createObjectStore('tasks', { keyPath: '_id' });
            }
            // My Tasks Store (User's Protocols)
            if (!db.objectStoreNames.contains('my_tasks')) {
                db.createObjectStore('my_tasks', { keyPath: '_id' });
            }
            // Requests Store
            if (!db.objectStoreNames.contains('requests')) {
                db.createObjectStore('requests', { keyPath: '_id' });
            }
        },
    });
};

export const dbService = {
    // Generic Get All
    async getAll(storeName) {
        const db = await initDB();
        return db.getAll(storeName);
    },

    // Generic Put (Insert/Update)
    async put(storeName, data) {
        const db = await initDB();
        if (Array.isArray(data)) {
            const tx = db.transaction(storeName, 'readwrite');
            await Promise.all(data.map(item => tx.store.put(item)));
            await tx.done;
        } else {
            await db.put(storeName, data);
        }
    },

    // Generic Delete
    async delete(storeName, id) {
        const db = await initDB();
        await db.delete(storeName, id);
    },

    // Clear Store
    async clear(storeName) {
        const db = await initDB();
        await db.clear(storeName);
    }
};
