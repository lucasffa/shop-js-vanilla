/*
    Developed by Lucas de Almeida. 
        - GitHub: https://github.com/lucasffa
        - LinkedIn: https://www.linkedin.com/in/lucasffa/

    Concept-designed by Miguel Rivero.
        - LinkedIn: https://www.linkedin.com/in/miguel-rivero-434831145/
        - GitHub: https://github.com/miguelojopi
        - Figma:
*/

// /js/db.js

const DB_NAME = 'ProductCatalogDB';
const DB_VERSION = 2;
const STORE_NAME = 'products';
const CATEGORY_STORE_NAME = 'categories';
const TTL = 60 * 1000;
const TTL_CATEGORIES = 10 * 1000;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log("Running onupgradeneeded");
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
            if (!db.objectStoreNames.contains(CATEGORY_STORE_NAME)) {
                const categoryStore = db.createObjectStore(CATEGORY_STORE_NAME, { keyPath: 'id' });
                categoryStore.createIndex('timestamp', 'timestamp', { unique: false });
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
    store.delete(id);
}

export async function clearExpiredProducts() {
    const store = await getTransaction(STORE_NAME, 'readwrite');
    const request = store.openCursor();
    request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
            const product = cursor.value;
            if ((Date.now() - product.timestamp) >= TTL) {
                store.delete(cursor.key);
            }
            cursor.continue();
        }
    };
}

export async function saveCategory(category) {
    const store = await getTransaction(CATEGORY_STORE_NAME, 'readwrite');
    category.timestamp = Date.now();
    store.put(category);
}

export async function getCategoriesFromDB() {
    const store = await getTransaction(CATEGORY_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
        const request = store.get('allCategories');
        request.onsuccess = () => {
            const categories = request.result;
            if (categories && (Date.now() - categories.timestamp) < TTL_CATEGORIES) {
                resolve(categories);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

export async function clearExpiredCategories() {
    const store = await getTransaction(CATEGORY_STORE_NAME, 'readwrite');
    const request = store.openCursor();
    request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
            const category = cursor.value;
            if ((Date.now() - category.timestamp) >= TTL_CATEGORIES) {
                store.delete(cursor.key);
            }
            cursor.continue();
        }
    };
}
