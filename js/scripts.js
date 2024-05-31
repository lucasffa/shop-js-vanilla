// scripts.js

import { renderForm, resetFormState, renderProducts, renderPagination } from './dom.js';
import { calculateTotalPages } from './pagination.js';
import { getCategories, getProducts, addProduct } from './api.js';

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
        const navUl = document.querySelector('nav ul');
        navUl.classList.toggle('dropdown');
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
