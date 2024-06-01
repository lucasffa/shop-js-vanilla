/*
    Developed by Lucas de Almeida. 
        - GitHub: https://github.com/lucasffa
        - LinkedIn: https://www.linkedin.com/in/lucasffa/

    Concept-designed by Miguel Rivero.
        - LinkedIn: https://www.linkedin.com/in/miguel-rivero-434831145/
        - GitHub: https://github.com/miguelojopi
        - Figma:
*/

// api.js

import { saveProduct, getProduct, clearExpiredProducts, saveCategory, getCategoriesFromDB, clearExpiredCategories } from './db.js';

const BASEURL = 'https://fakestoreapi.com';

export async function getCategories() {
    await clearExpiredCategories();
    let categories = await getCategoriesFromDB();
    if (!categories) {
        try {
            const response = await fetch(`${BASEURL}/products/categories`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            categories = await response.json();
            await saveCategory({ id: 'allCategories', categories, timestamp: Date.now() });
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    return categories.categories;
}

export async function getProducts(category) {
    await clearExpiredProducts();
    let products = await getProduct('allProducts');
    if (!products) {
        try {
            console.log('Fetching products from API')
            const response = await fetch(`${BASEURL}/products?limit=20`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            products = await response.json();
            await saveProduct({ id: 'allProducts', products, timestamp: Date.now() });
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    return category === 'all' ? products.products : products.products.filter(p => p.category === category);
}

export async function getProductById(id) {
    let product = await getProduct(id);
    if (!product) {
        try {
            const response = await fetch(`${BASEURL}/products/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            product = await response.json();
            await saveProduct({ id, ...product, timestamp: Date.now() });
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    return product;
}

export async function addProduct(formData) {
    try {
        const response = await fetch(`${BASEURL}/products`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to add product');
        }
        const product = await response.json();
        await saveProduct({ id: product.id, ...product, timestamp: Date.now() });
        return product;
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function deleteProduct(id) {
    try {
        const response = await fetch(`${BASEURL}/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        await deleteProduct(id);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function editProduct(id, data) {
    try {
        const response = await fetch(`${BASEURL}/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to edit product');
        }
        const updatedProduct = await response.json();
        await saveProduct({ id: updatedProduct.id, ...updatedProduct, timestamp: Date.now() });
        return updatedProduct;
    } catch (error) {
        console.error(error);
        return null;
    }
}
