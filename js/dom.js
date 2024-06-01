/*
    Developed by Lucas de Almeida. 
        - GitHub: https://github.com/lucasffa
        - LinkedIn: https://www.linkedin.com/in/lucasffa/

    Concept-designed by Miguel Rivero.
        - LinkedIn: https://www.linkedin.com/in/miguel-rivero-434831145/
        - GitHub: https://github.com/miguelojopi
        - Figma:
*/

// /js/dom.js

import { getCategories } from "./api.js";

export const newProductButton = document.getElementById('new-item');
export const catalogSection = document.getElementById('catalog');
export const paginationSection = document.getElementById('pagination');
export const SECONDARY_COLOR_1000 = '#181A2D';

export function resetFormState() {
    document.querySelectorAll('.error').forEach(label => label.classList.remove('error'));
    document.querySelectorAll('.shake').forEach(input => input.classList.remove('shake'));
    const formError = document.getElementById('form-error');
    formError.classList.add('hidden');
    const submitButton = document.getElementById('submit-button');
    submitButton.textContent = 'Register';
}

export function renderProducts(products) {
    catalogSection.innerHTML = '';
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'catalog-item';

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.title;

        const kebabMenu = document.createElement('div');
        kebabMenu.className = 'item-kebab-menu';
        kebabMenu.innerHTML = '<img src="img/kebab.svg" alt="Kebab Menu">';

        const kebabOptions = document.createElement('div');
        kebabOptions.className = 'item-kebab-options';

        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.setAttribute('aria-label', 'Edit');
        editButton.innerHTML = `<img src="img/edit.svg" alt="Edit">`;
        // editButton.addEventListener('click', () => editProductItem(product.id)); // Define editProductItem function in scripts.js

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.setAttribute('aria-label', 'Delete');
        deleteButton.innerHTML = `<img src="img/delete.svg" alt="Delete">`;
        // deleteButton.addEventListener('click', () => deleteProductItem(product.id)); // Define deleteProductItem function in scripts.js

        kebabOptions.appendChild(editButton);
        kebabOptions.appendChild(deleteButton);

        const name = document.createElement('p');
        name.className = 'label';
        name.textContent = product.title;

        const price = document.createElement('p');
        price.className = 'price';
        price.textContent = `$${product.price}`;

        const thisDiv = document.createElement('div');
        thisDiv.className = 'inferior';
        thisDiv.appendChild(name);
        thisDiv.appendChild(price);

        item.appendChild(img);
        item.appendChild(kebabMenu);
        item.appendChild(kebabOptions);
        item.appendChild(thisDiv);

        catalogSection.appendChild(item);
    });
}

export async function renderPagination(totalPages, currentPage, loadProducts) {
    const paginationSection = document.getElementById('pagination');
    paginationSection.innerHTML = '';

    if (totalPages <= 1) {
        paginationSection.style.display = 'none';
        return;
    } else {
        paginationSection.style.display = 'flex';
    }

    const fetchSVG = async (url) => {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const svgDocument = parser.parseFromString(text, 'image/svg+xml');
        return svgDocument.querySelector('svg');
    };

    const firstPageSvgElement = await fetchSVG('img/first_page.svg');
    firstPageSvgElement.setAttribute('fill', SECONDARY_COLOR_1000);

    const lastPageSvgElement = await fetchSVG('img/last_page.svg');
    lastPageSvgElement.setAttribute('fill', SECONDARY_COLOR_1000);

    const firstPage = document.createElement('button');
    firstPage.className = 'first-page-button';
    firstPage.appendChild(firstPageSvgElement);
    firstPage.disabled = currentPage === 1;
    firstPage.addEventListener('click', () => {
        loadProducts(1);
    });
    paginationSection.appendChild(firstPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = currentPage === i ? 'active' : '';
        pageButton.addEventListener('click', () => {
            loadProducts(i);
        });
        paginationSection.appendChild(pageButton);
    }

    const lastPage = document.createElement('button');
    lastPage.className = 'last-page-button';
    lastPage.appendChild(lastPageSvgElement);
    lastPage.disabled = currentPage === totalPages;
    lastPage.addEventListener('click', () => {
        loadProducts(totalPages);
    });
    paginationSection.appendChild(lastPage);
}



export async function renderForm(handleFormSubmit) {
    const formSection = document.createElement('section');
    formSection.id = 'form-section';

    const response = await fetch('/components/new_product_form.html');
    const htmlContent = await response.text();

    formSection.innerHTML = htmlContent;

    document.body.appendChild(formSection);

    function handleClickOutside(event) {
        const newProductForm = document.getElementById('new-product-form');
        try {
            if (!newProductForm.contains(event.target)) {
                document.body.removeChild(formSection);
                document.removeEventListener('click', handleClickOutside);
            }

        } catch(e) {

        }
    }

    document.addEventListener('click', handleClickOutside);

    const closeFormButton = document.getElementById('close-form');
    closeFormButton.addEventListener('click', (event) => {
        event.stopPropagation();
        document.body.removeChild(formSection);
        document.removeEventListener('click', handleClickOutside);
    });

    const newProductForm = document.getElementById('new-product-form');
    newProductForm.addEventListener('submit', handleFormSubmit);

    const categorySelect = document.getElementById('product-category');
    const categories = await getCategories();

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
}
