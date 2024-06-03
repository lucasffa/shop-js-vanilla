/*
    Developed by Lucas de Almeida. 
        - GitHub: https://github.com/lucasffa
        - LinkedIn: https://www.linkedin.com/in/lucasffa/

    Concept-designed by Miguel Rivero.
        - LinkedIn: https://www.linkedin.com/in/miguel-rivero-434831145/
        - GitHub: https://github.com/miguelojopi
        - Figma:
*/

// /js/scripts.js

import { renderForm, resetFormState, renderProducts, renderPagination, newProductButton, renderEditForm, SECRET_KEY, SHOP_WHATSAPP } from './dom.js';
import { calculateTotalPages } from './pagination.js';
import { getCategories, getProducts, addProduct, deleteProduct, editProduct } from './api.js';
import { ProductDTO, ProductEditDTO } from './dto.js';

let currentPage = 1;
let totalProducts = 0;
let totalPages = 1;
let categories = [];
let currentCategory = 'all';
const ITEMS_PER_PAGE = 8;


export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidWhatsAppNumber(number) {
    const regex = /^\d{12,13}$/;
    return regex.test(number);
}

export function generateSignature(payload, secret) {
    return CryptoJS.HmacSHA256(JSON.stringify(payload), secret).toString(CryptoJS.enc.Base64);
}

export function redirectToWhatsApp(product) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    
    const payload = {
        name: product.title,
        id: product.id,
        price: product.price,
        contactDate: currentDate.toISOString()
    };

    const signature = generateSignature(payload, SECRET_KEY);

    const emojis = {
        cart: '🛒',
        priceTag: '🏷️',
        calendar: '📅',
        shoppingBag: '🛍️',
        airplane: '✈️'
    };

    const message = `Olá, tudo bem? %0A${emojis.cart} Estou interessado em: ${product.title} %0A${emojis.priceTag} Preço: $${product.price} %0A${emojis.calendar} Dia do contato: ${formattedDate} %0A %0AEu aguardo retorno! ${emojis.shoppingBag}${emojis.airplane} %0A %0A Protocolo de contato: ${signature}`;

    const encodedMessage = message;
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${SHOP_WHATSAPP}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

export function openWhatsAppNumberDialog() {
    const newNumber = prompt("Enter the new WhatsApp number (12 or 13 digits):", SHOP_WHATSAPP);

    if (newNumber !== null) {
        if (isValidWhatsAppNumber(newNumber)) {
            SHOP_WHATSAPP = newNumber;
            alert("WhatsApp number updated successfully!");
        } else {
            alert("Invalid number. Please enter a valid WhatsApp number with 12 or 13 digits.");
        }
    }
}

export async function loadCategories() {
    categories = await getCategories();
    console.log('Estas são as categories carregadas -- categories: ', categories)
    const nav = document.querySelector('nav ul');
    const allLink = document.createElement('li');
    const allAnchor = document.createElement('a');
    allAnchor.href = '#';
    allAnchor.textContent = 'All';
    allAnchor.dataset.category = 'all';
    allAnchor.className = 'category';
    allLink.appendChild(allAnchor);
    nav.appendChild(allLink);

    categories.forEach(category => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        a.dataset.category = category;
        a.className = 'category';
        a.addEventListener('click', (event) => {
            event.preventDefault();
            setActiveCategory(a);
            currentCategory = category;
            currentPage = 1;
            loadProducts(currentPage);
        });
        li.appendChild(a);
        nav.appendChild(li);
    });

    function setActiveCategory(activeAnchor) {
        const allAnchors = document.querySelectorAll('nav ul li a');
        allAnchors.forEach(anchor => {
            anchor.classList.remove('active');
        });
        activeAnchor.classList.add('active');
    }

    allAnchor.addEventListener('click', (event) => {
        event.preventDefault();
        setActiveCategory(allAnchor);
        currentCategory = 'all';
        currentPage = 1;
        loadProducts(currentPage);
    });

    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const navUl = document.querySelector('nav ul');
        navUl.classList.toggle('dropdown');
    });

    document.addEventListener('click', (event) => {
        const navUl = document.querySelector('nav ul');
        if (navUl.classList.contains('dropdown') && !dropdownMenu.contains(event.target) && !navUl.contains(event.target)) {
            navUl.classList.remove('dropdown');
        }
    });

    setActiveCategory(allAnchor);
}

export async function loadProducts(page = 1) {
    currentPage = page;
    try {
        const products = await getProducts(currentCategory);
        if (!products || !Array.isArray(products)) {
            throw new Error('Failed to load products');
        }
        totalProducts = products.length;
        totalPages = calculateTotalPages(totalProducts, ITEMS_PER_PAGE);
        const currentProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        renderProducts(currentProducts);
        renderPagination(totalPages, currentPage, loadProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}


export function showNewProductForm() {
    renderForm();
}

class ProductFormHandler {
    constructor(formElement) {
        this.formElement = formElement;
        this.submitButton = this.formElement.querySelector('#submit-button');
        this.formError = this.formElement.querySelector('#form-error');
        this.formElement.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    async handleFormSubmit(event) {
        console.log('Running handleFormSubmit.')
        event.preventDefault();
        this.resetFormState();

        const formData = new FormData(this.formElement);
        const imageFile = formData.get('image');
        let imageBase64 = null;

        if (imageFile && imageFile.size > 0) {
            imageBase64 = await this.getBase64(imageFile);
        }

        const productDTO = new ProductDTO(
            formData.get('title'),
            formData.get('description'),
            formData.get('price'),
            formData.get('category'),
            null,
            imageBase64
        );

        console.log('Loggin productDTO: ', productDTO)

        if (this.validateForm(productDTO)) {
            const result = await addProduct(productDTO);
            if (result && result.success !== false) {
                this.submitButton.textContent = 'Success';
                setTimeout(() => {
                    document.body.removeChild(document.getElementById('form-section'));
                }, 2000);
                newProductButton.classList.remove('disabled');
                loadProducts(currentPage);
            } else {
                console.log("There was an error adding product inside of submitting handler.")
                this.formError.classList.remove('hidden');
            }
        } else {
            console.log("There was an error validating product.")
        }
    }

    validateForm(productDTO) {
        let valid = true;

        if (!productDTO.title || productDTO.title.length <= 3) {
            this.showValidationError('title');
            valid = false;
        }
        if (!productDTO.description || productDTO.description.length <= 5) {
            this.showValidationError('description');
            valid = false;
        }
        const priceRegex = /^\d+(\.\d{1,2})?$/;
        if (!productDTO.price || !priceRegex.test(productDTO.price)) {
            this.showValidationError('price');
            valid = false;
        }
        if (!productDTO.category || !categories.includes(productDTO.category)) {
            this.showValidationError('category');
            valid = false;
        }

        return valid;
    }

    showValidationError(fieldName) {
        const input = this.formElement.querySelector(`[name="${fieldName}"]`);
        input.previousElementSibling.classList.add('error');
        input.classList.add('shake');
    }

    resetFormState() {
        const inputs = this.formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('shake');
            input.previousElementSibling.classList.remove('error');
        });
        this.formError.classList.add('hidden');
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}
class ProductEditFormHandler {
    constructor(formElement, productId, editedFields) {
        this.formElement = formElement;
        this.submitButton = this.formElement.querySelector('#submit-button');
        this.formError = this.formElement.querySelector('#form-error');
        this.productId = productId;
        this.editedFields = editedFields;
        this.formElement.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    async handleFormSubmit(event) {
        console.log('Running handleFormSubmit.');
        event.preventDefault();
        this.resetFormState();

        const formData = new FormData(this.formElement);
        const imageFile = formData.get('image');
        let imageBase64 = null;

        if (imageFile && imageFile.size > 0) {
            imageBase64 = await this.getBase64(imageFile);
        }

        const productEditDTO = new ProductEditDTO(
            this.productId,
            this.editedFields.title || formData.get('title'),
            this.editedFields.description || formData.get('description'),
            this.editedFields.price || formData.get('price'),
            this.editedFields.category || formData.get('category'),
            null,
            imageBase64
        );

        console.log('Logging productEditDTO: ', productEditDTO);

        if (this.validateForm(productEditDTO)) {
            const result = await editProduct(this.productId, productEditDTO);
            if (result && result.success !== false) {
                this.submitButton.textContent = 'Success';
                setTimeout(() => {
                    try {
                        document.body.removeChild(document.getElementById('form-section'));
                    } catch {
                        // No handle
                    }
                }, 2000);
                newProductButton.classList.remove('disabled');
                loadProducts(currentPage);
            } else {
                console.log("There was an error editing product inside of submitting handler.");
                this.formError.classList.remove('hidden');
            }
        } else {
            console.log("There was an error validating product.");
        }
    }

    validateForm(productDTO) {
        let valid = true;

        if (!productDTO.title || productDTO.title.length <= 3) {
            this.showValidationError('title');
            valid = false;
        }

        if (!productDTO.description || productDTO.description.length <= 5) {
            this.showValidationError('description');
            valid = false;
        }

        const priceRegex = /^\d+(\.\d{1,2})?$/;
        if (!productDTO.price || !priceRegex.test(productDTO.price)) {
            this.showValidationError('price');
            valid = false;
        }

        if (!productDTO.category || !categories.includes(productDTO.category)) {
            this.showValidationError('category');
            valid = false;
        }

        return valid;
    }

    showValidationError(fieldName) {
        const input = this.formElement.querySelector(`[name="${fieldName}"]`);
        input.previousElementSibling.classList.add('error');
        input.classList.add('shake');
    }

    resetFormState() {
        const inputs = this.formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('shake');
            input.previousElementSibling.classList.remove('error');
        });
        this.formError.classList.add('hidden');
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}


export function initProductForm() {
    const formElement = document.getElementById('new-product-form');
    new ProductFormHandler(formElement);
}

export function initEditProductForm(productId, editedFields) {
    const formElement = document.getElementById('new-product-form');
    new ProductEditFormHandler(formElement, productId, editedFields);
}

export async function editProductItem(product) {
    await renderEditForm(product);

    //await delay(1000);

    const formElement = document.getElementById('new-product-form');
    const titleInput = formElement.querySelector('#product-name');
    const descriptionInput = formElement.querySelector('#product-description');
    const priceInput = formElement.querySelector('#product-price');
    const categorySelect = formElement.querySelector('#product-category');
    const imageInput = formElement.querySelector('#product-image');
    const imagePreview = formElement.querySelector('#image-preview');

    titleInput.value = product.title;
    descriptionInput.value = product.description;
    priceInput.value = product.price;
    categorySelect.value = product.category;
    imagePreview.style.backgroundImage = `url(${product.image})`;
    imageInput.removeAttribute('required');

    const editedFields = {};

    titleInput.addEventListener('change', () => editedFields.title = titleInput.value);
    descriptionInput.addEventListener('change', () => editedFields.description = descriptionInput.value);
    priceInput.addEventListener('change', () => editedFields.price = priceInput.value);
    categorySelect.addEventListener('change', () => editedFields.category = categorySelect.value);
    imageInput.addEventListener('change', () => editedFields.imageInput = imageInput.value);

    new ProductEditFormHandler(formElement, product.id, editedFields);
}

export async function deleteProductItem(id) {
    const confirmation = confirm("Are you sure you want to delete this product?");
    if (confirmation) {
        await deleteProduct(id);
        loadProducts(currentPage);
    }
}