const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const fileName = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function isImage(file) {
    const imageTypes = ['image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']

    return file && imageTypes.includes(file['type']);
}

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center'
        }
    });
}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center'
        }
    });
}

function loadImage(e) {
    const file = e.target.files[0];

    if (!isImage(file)) {
        alertError('Please select an image!');
        return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    }

    form.style.display = 'block';
    fileName.innerText = file.name;
    outputPath.innerText = path.dirname(file.path);
}

function sendImage(e) {
    e.preventDefault();

    const imgWidth = widthInput.value;
    const imgHeight = heightInput.value;
    const imgPath = img.files[0].path;

    if (!img.files[0]) {
        alertError('Please upload an image!');
        return;
    }

    if (imgWidth === '' || imgHeight === '') {
        alertError('Please fill in Width & Height!');
        return;
    }

    ipcRenderer.send('image_resize', {
        imgPath,
        imgWidth,
        imgHeight
    });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);

ipcRenderer.on('image_done', () => {
    alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`);
});