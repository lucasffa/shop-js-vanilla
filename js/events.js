// events.js

import { showNewProductForm, loadProducts, loadCategories } from './scripts.js';
import { newProductButton } from './dom.js';

newProductButton?.addEventListener('click', showNewProductForm);

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    setupBannerActions();
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
