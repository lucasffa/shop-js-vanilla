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
const DB_VERSION = 4;
const STORE_NAME = 'products';
const CATEGORY_STORE_NAME = 'categories';
const TTL = 30 * 1000;
const TTL_CATEGORIES = 60 * 1000;

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
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    });
}

export async function saveProduct(product) {
    try {
        const store = await getTransaction(STORE_NAME, 'readwrite');
        return await new Promise((resolve, reject) => {
            const request = store.put(product);
            request.onsuccess = () => resolve(request);
            request.onerror = (event) => reject('IndexedDB error: ' + event.target.errorCode);
        });
    } catch (error) {
        console.error('Error saving product:', error);
    }
}


export async function editProductFromDB(id, updatedFields) {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const existingProduct = getRequest.result;
                if (existingProduct) {
                    const updatedProduct = { ...existingProduct, ...updatedFields, timestamp: Date.now() };
                    console.log('In db.editProductFromDB, logging updatedProduct before store.put(updatedProduct): ', updatedProduct);
                    const putRequest = store.put(updatedProduct);
                    putRequest.onsuccess = () => {
                        resolve(updatedProduct);
                    };
                    putRequest.onerror = (event) => {
                        reject('IndexedDB error: ' + event.target.errorCode);
                    };
                } else {
                    reject('Product not found');
                }
            };
            getRequest.onerror = (event) => {
                reject('IndexedDB error: ' + event.target.errorCode);
            };
        });
    } catch (error) {
        console.error('Error editing product:', error);
    }
}


export async function getProduct(id) {
    const store = await getTransaction(STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            const product = request.result;
            if (product && (Date.now() - product.timestamp) < TTL) {
                resolve(product);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

export async function getAllProducts() {
    const store = await getTransaction(STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const products = request.result.filter(product => (Date.now() - product.timestamp) < TTL);
            resolve(products);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function deleteProductFromDB(id) {
    const store = await getTransaction(STORE_NAME, 'readwrite');
    store.delete(id);
}

export async function clearExpiredProducts(category) {
    const store = await getTransaction(STORE_NAME, 'readwrite');
    const request = store.openCursor();
    request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
            const product = cursor.value;
            console.log('In db.clearExpiredProducts, logging product from cursor.value: ', product)
            if (category == 'prefetch' || ((Date.now() - product.timestamp) >= TTL)) {
                console.log('Deleting this product: ', product)
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

export async function clearExpiredCategories(category = '') {
    const store = await getTransaction(CATEGORY_STORE_NAME, 'readwrite');
    const request = store.openCursor();
    request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
            const category = cursor.value;
            if ((Date.now() - category.timestamp) >= TTL_CATEGORIES || category == 'prefetch') {
                store.delete(cursor.key);
            }
            cursor.continue();
        }
    };
}
