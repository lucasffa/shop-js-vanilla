// db.js

const DB_NAME = 'ProductCatalogDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';
const TTL = 60 * 1000;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject('IndexedDB error: ' + event.target.errorCode);
        };
    });
}

function getTransaction(storeName, mode) {
    return openDB().then((db) => {
        return db.transaction(storeName, mode).objectStore(storeName);
    });
}

export async function saveProduct(product) {
    const store = await getTransaction(STORE_NAME, 'readwrite');
    product.timestamp = Date.now();
    store.put(product);
}

export async function getProduct(id) {
    const store = await getTransaction(STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            const product = request.result;
            if (product && (Date.now() - product.timestamp) < TTL) {
                console.log(product)
                resolve(product);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

export async function deleteProduct(id) {
    const store = await getTransaction(STORE_NAME, 'readwrite');
}

export async function clearExpiredProducts() {
    const store = await getTransaction(STORE_NAME, 'readwrite');
    const request = store.openCursor();
    request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
            const product = cursor.value;
            if ((Date.now() - product.timestamp) >= TTL) {
            }
            cursor.continue();
        }
    };
}
