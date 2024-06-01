/*
    Developed by Lucas de Almeida. 
        - GitHub: https://github.com/lucasffa
        - LinkedIn: https://www.linkedin.com/in/lucasffa/

    Concept-designed by Miguel Rivero.
        - LinkedIn: https://www.linkedin.com/in/miguel-rivero-434831145/
        - GitHub: https://github.com/miguelojopi
        - Figma:
*/

// /js/events.js

import { showNewProductForm, loadProducts, loadCategories } from './scripts.js';
import { newProductButton } from './dom.js';
import { getCategories, getProducts } from './api.js';

newProductButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    showNewProductForm();
});

document.addEventListener('DOMContentLoaded', async () => {


    // Pre-fetching
    console.log('Fetching initial categories to store in IndexedDB');
    await getCategories('all');
    console.log('Fetching initial products to store in IndexedDB');
    await getProducts('all');

    // Loadings and setups
    loadCategories();
    await loadProducts();
    setupBannerActions();

    // Images get transparent transformated below
    // Disabled, once it consumes too much from the browser
    /*
    const catalogItems = document.querySelectorAll('.catalog-item img');

    catalogItems.forEach(img => {
        img.crossOrigin = "Anonymous";
        img.addEventListener('load', () => {
            removeWhiteBackground(img);
        });
    });

    function removeWhiteBackground(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Detect white and near white colors
            if (r >= 240 && g >= 240 && b >= 240) {
                data[i + 3] = 0;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Replace the image source with the new transparent image
        img.src = canvas.toDataURL();
    }*/
});

function setupBannerActions() {
    const editBannerButton = document.getElementById('edit-banner');
    const deleteBannerButton = document.getElementById('delete-banner');
    const bannerImage = document.getElementById('banner-image');
    const kebabMenu = document.querySelector('.kebab-menu');
    const kebabOptions = document.querySelector('.kebab-options');

    if (editBannerButton && deleteBannerButton && bannerImage && kebabMenu && kebabOptions) {
        editBannerButton.addEventListener('click', () => {
            const newBannerImage = prompt('Enter the URL of the new banner image:');
            if (newBannerImage) {
                bannerImage.src = newBannerImage;
            }
        });

        deleteBannerButton.addEventListener('click', () => {
            bannerImage.src = '';
        });

        kebabMenu.addEventListener('mouseenter', () => {
            kebabOptions.style.display = 'block';
        });

        kebabMenu.addEventListener('mouseleave', (event) => {
            if (!kebabMenu.contains(event.relatedTarget)) {
                kebabOptions.style.display = 'none';
            }
        });

        kebabOptions.addEventListener('mouseenter', () => {
            kebabOptions.style.display = 'block';
        });

        kebabOptions.addEventListener('mouseleave', () => {
            kebabOptions.style.display = 'none';
        });
    }
}
