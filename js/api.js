// api.js

const BASEURL = 'https://fakestoreapi.com';

export async function getCategories() {
    try {
        const response = await fetch(`${BASEURL}/products/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getProducts(category) {
    try {
        const response = await fetch(`${BASEURL}/products?limit=20`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        return category === 'all' ? products : products.filter(p => p.category === category);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getProductById(id) {
    try {
        const response = await fetch(`${BASEURL}/products/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
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
        return await response.json();
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
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function editProduct(id, data) {
    try {
        const response = await fetch(`${BASEURL}/products/${id}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to edit product');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}
