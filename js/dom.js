export const newProductButton = document.getElementById('new-item');
export const catalogSection = document.getElementById('catalog');
export const paginationSection = document.getElementById('pagination');

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
        // editButton.addEventListener('click', () => editProductItem(product.id)); 
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.setAttribute('aria-label', 'Delete');
        deleteButton.innerHTML = `<img src="img/delete.svg" alt="Delete">`;
        // deleteButton.addEventListener('click', () => deleteProductItem(product.id));
        
        kebabOptions.appendChild(editButton);
        kebabOptions.appendChild(deleteButton);

        const name = document.createElement('p');
        name.textContent = product.title;
        name.className = 'label';

        const price = document.createElement('p');
        price.textContent = `$${product.price}`;
        price.className = 'price';

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

export function renderPagination(totalPages, currentPage, loadProducts) {
    paginationSection.innerHTML = '';

    if (totalPages <= 1) return;

    const firstPage = document.createElement('button');
    firstPage.textContent = '<<';
    firstPage.disabled = currentPage === 1;
    firstPage.addEventListener('click', () => {
        loadProducts(1);
    });

    const lastPage = document.createElement('button');
    lastPage.textContent = '>>';
    lastPage.disabled = currentPage === totalPages;
    lastPage.addEventListener('click', () => {
        loadProducts(totalPages);
    });

    paginationSection.appendChild(firstPage);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.disabled = i === currentPage;
        pageButton.addEventListener('click', () => {
            loadProducts(i);
        });
        paginationSection.appendChild(pageButton);
    }

    paginationSection.appendChild(lastPage);
}

export function renderForm(handleFormSubmit) {
    const formSection = document.createElement('section');
    formSection.id = 'form-section';
    formSection.innerHTML = `
        <form id="new-product-form">
            <h2>New Product</h2>
            <button type="button" id="close-form" aria-label="Close Form">X</button>
            <div>
                <label for="product-image">Photo</label>
                <input type="file" id="product-image" name="image" required>
            </div>
            <div>
                <label for="product-name">Product Name</label>
                <input type="text" id="product-name" name="name" required>
            </div>
            <div>
                <label for="product-description">Product Description</label>
                <textarea id="product-description" name="description" required></textarea>
            </div>
            <div>
                <label for="product-price">Price</label>
                <input type="number" id="product-price" name="price" required>
            </div>
            <div>
                <label for="product-category">Category</label>
                <select id="product-category" name="category" required>
                    <!-- Options will be populated dynamically here -->
                </select>
            </div>
            <button type="submit" id="submit-button">Register</button>
            <p id="form-error" class="hidden">Try again.</p>
        </form>
    `;

    document.body.appendChild(formSection);

    const closeFormButton = document.getElementById('close-form');
    closeFormButton.addEventListener('click', () => {
        document.body.removeChild(formSection);
    });

    const newProductForm = document.getElementById('new-product-form');
    newProductForm.addEventListener('submit', handleFormSubmit);
}
