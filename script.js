const images = [
    "paris_eiffel_tower_1772208235326.png",
    "japan_mount_fuji_1772208248666.png",
    "venice_canals_1772208263842.png",
    "maldives_beach_1772208278284.png",
    "greece_santorini_1772208292347.png"
];

document.addEventListener('DOMContentLoaded', () => {
    const bank = document.getElementById('bank');

    images.forEach((filename, index) => {
        const img = document.createElement('img');
        img.src = `assets/${filename}`;
        img.id = `img-${index}`;
        img.className = 'draggable-item';
        img.draggable = true;
        img.alt = `Portrait ${index + 1}`;

        img.addEventListener('dragstart', drag);

        bank.appendChild(img);
    });

    // Handle File Uploads
    const uploadInput = document.getElementById('imageUpload');
    uploadInput.addEventListener('change', handleUpload);
});

function handleUpload(event) {
    const files = event.target.files;
    const bank = document.getElementById('bank');

    if (files.length > 0) {
        Array.from(files).forEach((file, i) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.id = `uploaded-${Date.now()}-${i}`; // Unique ID
                img.className = 'draggable-item';
                img.draggable = true;
                img.alt = file.name;
                img.addEventListener('dragstart', drag);
                bank.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.style.opacity = "0.5";
}

// Add global dragend listener to reset opacity if drop fails or succeeds
document.addEventListener('dragend', (ev) => {
    if (ev.target.classList.contains('draggable-item')) {
        ev.target.style.opacity = "1";
    }
});

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    if (!draggedElement) return;

    // Restore opacity
    draggedElement.style.opacity = "1";

    let target = ev.target;

    // If dropped on an image, remember the image so we can insert relative to it
    let dropOnImage = null;
    if (target.classList.contains('draggable-item')) {
        dropOnImage = target;
        target = target.parentElement;
    }

    // Ensure we are dropping into a valid container
    if (target.classList.contains('tier-content') || target.classList.contains('image-bank')) {
        if (dropOnImage && dropOnImage !== draggedElement) {
            // Determine if we should insert before or after the target image
            const boundingBox = dropOnImage.getBoundingClientRect();
            const dropPointX = ev.clientX;
            const midpoint = boundingBox.left + (boundingBox.width / 2);

            if (dropPointX < midpoint) {
                target.insertBefore(draggedElement, dropOnImage);
            } else {
                target.insertBefore(draggedElement, dropOnImage.nextSibling);
            }
        } else {
            target.appendChild(draggedElement);
        }
    }
}
