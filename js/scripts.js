import { renderForm, resetFormState, renderProducts, renderPagination } from './dom.js';
import { calculateTotalPages } from './pagination.js';
import { getCategories, getProducts, addProduct } from './api.js';

let currentPage = 1;
let totalProducts = 0;
let totalPages = 1;
let categories = [];
let currentCategory = 'all';
const ITEMS_PER_PAGE = 8;

export async function loadCategories() {
    categories = await getCategories();
    const nav = document.querySelector('nav ul');
    categories.forEach(category => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        a.dataset.category = category;
        a.addEventListener('click', (event) => {
            event.preventDefault();
            currentCategory = category;
            currentPage = 1;
            loadProducts(currentPage);
        });
        li.appendChild(a);
        nav.appendChild(li);
    });

    const allLink = document.querySelector('[data-category="all"]');
    allLink.addEventListener('click', (event) => {
        event.preventDefault();
        currentCategory = 'all';
        currentPage = 1;
        loadProducts(currentPage);
    });
}

export async function loadProducts(page = 1) {
    currentPage = page;
    const products = await getProducts(currentCategory);
    totalProducts = products.length;
    totalPages = calculateTotalPages(totalProducts, ITEMS_PER_PAGE);
    const currentProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    renderProducts(currentProducts);
    renderPagination(totalPages, currentPage, loadProducts);
}

export function showNewProductForm() {
    renderForm(handleFormSubmit);
}

export async function handleFormSubmit(event) {
    event.preventDefault();
    resetFormState();

    const formData = new FormData(event.target);

    if (validateForm(formData)) {
        const result = await addProduct(formData);
        if (result.success !== false) {
            const submitButton = document.getElementById('submit-button');
            submitButton.textContent = 'Success';
            setTimeout(() => {
                document.body.removeChild(document.getElementById('form-section'));
            }, 2000);
            loadProducts(currentPage);
        } else {
            const formError = document.getElementById('form-error');
            formError.classList.remove('hidden');
        }
    }
}

function validateForm(formData) {
    let valid = true;
    for (let [key, value] of formData.entries()) {
        const input = document.querySelector(`[name="${key}"]`);
        if (!value) {
            input.previousElementSibling.classList.add('error');
            input.classList.add('shake');
            valid = false;
        }
    }
    return valid;
}
