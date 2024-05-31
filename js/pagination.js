// pagination.js

export function calculateTotalPages(totalProducts, itemsPerPage) {
    return Math.ceil(totalProducts / itemsPerPage);
}
