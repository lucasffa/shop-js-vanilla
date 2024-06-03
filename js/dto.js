// dto.js

export class ProductDTO {
    constructor(title, description, price, category, image, imageBase64) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.image = image;
        this.imageBase64 = imageBase64;
    }

    toFormData() {
        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('description', this.description);
        formData.append('price', this.price);
        formData.append('category', this.category);
        formData.append('image', this.image);
        if (this.imageBase64) {
            formData.append('imageBase64', this.imageBase64);
        } else {
            formData.append('image', this.image);
        }
        return formData;
    }
}


export class ProductEditDTO {
    constructor(id, title, description, price, category, image, imageBase64) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.image = image;
        this.imageBase64 = imageBase64;
    }

    toFormData() {
        const formData = new FormData();
        if(this.id){
            formData.append('id', this.id);
        }
        formData.append('title', this.title);
        formData.append('description', this.description);
        formData.append('price', this.price);
        formData.append('category', this.category);
        formData.append('image', this.image);
        if (this.imageBase64) {
            formData.append('imageBase64', this.imageBase64);
        } else {
            formData.append('image', this.image);
        }
        return formData;
    }
}

