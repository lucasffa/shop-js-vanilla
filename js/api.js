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

import { saveProduct, getProduct, clearExpiredProducts, saveCategory, getCategoriesFromDB, clearExpiredCategories, getAllProducts, deleteProductFromDB, editProductFromDB } from './db.js';
import { ProductDTO } from './dto.js';

const BASEURL = 'https://fakestoreapi.com';

export async function getCategories(category = '') {
    await clearExpiredCategories(category);
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
    console.log('Executando db.clearExpiredProducts em api.getProducts');
    await clearExpiredProducts();
    console.log('Executando db.getAllProducts em api.getProducts');
    let products = (category == 'prefetch') ? 0 : await getAllProducts();
    if (!products.length) {
        try {
            console.log('Fetching products from API');
            const response = await fetch(`${BASEURL}/products?limit=20`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const fetchedProducts = await response.json();
            for (const product of fetchedProducts) {
                await saveProduct({ id: product.id, ...product, timestamp: Date.now() });
            }
            products = fetchedProducts;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    return category === 'all' ? products : products.filter(p => p.category === category);
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


export async function addProduct(productDTO) {
    console.log('productDTO: ', productDTO);
    try {
        const formData = productDTO.toFormData();
        const response = await fetch(`${BASEURL}/products`, {
            method: 'POST',
            body: formData,
        });

        const responseBodyText = await response.text();
        console.log('Response Body as Text:', responseBodyText);

        try {
            const responseBodyJson = JSON.parse(responseBodyText);
            console.log('Response Body as JSON:', responseBodyJson);

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            const product = {
                id: responseBodyJson.id,
                title: productDTO.title,
                description: productDTO.description,
                price: productDTO.price,
                category: productDTO.category,
                image: responseBodyJson.image || productDTO.imageBase64,
                timestamp: Date.now()
            };

            const saveProductLog = await saveProduct(product);
            console.log('saveProductLog: ', saveProductLog);
            getProduct('prefetch');
            return product;
        } catch (jsonError) {
            console.error('Failed to parse response body as JSON:', jsonError);
            throw new Error('Failed to parse response body as JSON');
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false };
    }
}

export async function deleteProduct(id) {
    console.log('Deleting product id: ', id)
    try {
        const response = await fetch(`${BASEURL}/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        await deleteProductFromDB(id);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}


export async function editProduct(id, productEditDTO) {
    console.log('In api.editProduct, logging id: ', id)
    const updatedFields = {};
    for (const key in productEditDTO) {
        if (productEditDTO[key] !== null && productEditDTO[key] !== undefined) {
            console.log('In api.editProduct, loggin productEditDTO[key], for [key] = ', key ,' : ', productEditDTO[key])
            updatedFields[key] = productEditDTO[key];
        }
    }
    console.log('In api.editProduct, logging updatedFields', updatedFields)

    try {
        const response = await fetch(`${BASEURL}/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedFields),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to edit product');
        }
        const updatedProduct = await response.json();
        await editProductFromDB(id, updatedFields);
        return updatedProduct;
    } catch (error) {
        console.error(error);
        return null;
    }
}