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

import { renderForm, resetFormState, renderProducts, renderPagination, newProductButton } from './dom.js';
import { calculateTotalPages } from './pagination.js';
import { getCategories, getProducts, addProduct } from './api.js';
import { ProductDTO } from './dto.js';

let currentPage = 1;
let totalProducts = 0;
let totalPages = 1;
let categories = [];
let currentCategory = 'all';
const ITEMS_PER_PAGE = 8;


export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
                this.formError.classList.remove('hidden');
            }
        }
    }

    validateForm(productDTO) {
        let valid = true;

        if (!productDTO.title) {
            this.showValidationError('title');
            valid = false;
        }
        if (!productDTO.description) {
            this.showValidationError('description');
            valid = false;
        }
        if (!productDTO.price) {
            this.showValidationError('price');
            valid = false;
        }
        if (!productDTO.category) {
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