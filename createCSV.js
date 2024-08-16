const fs = require('fs');
const path = require('path');

// CSV original
let csvData = `
product_handle,rating,author,email,body,created_at
gafas,5,Carlos Martínez,carlos.martinez@example.com,"Las Ultra-ligero Lazy Gafas son perfectas para ver televisión tumbado. Son cómodas y ligeras. 😎 Me han encantado y las recomiendo para quienes les gusta leer en la cama.",2024-07-18 15:23:00 UTC  
gafas,4,Ana Gómez,ana.gomez@example.com,"Me gustaron estas gafas. Son un poco más pesadas de lo que esperaba, pero muy útiles para leer. No me arrepiento de la compra.",2024-08-02 12:45:00 UTC     
gafas,3,Marcos López,marcos.lopez@example.com,"El diseño es práctico, pero siento que la calidad podría mejorar. Funciona bien para ver la TV tumbado, pero no es lo que esperaba del todo.",2024-08-12 08:30:00 UTC 
`;

// Lista de URLs de imágenes
const image_urls = [
    'http://example.com/image1.jpg',
    'http://example.com/image2.jpg',
    'http://example.com/image3.jpg',
    // Agrega más URLs según sea necesario
];

// Dividir el texto en filas
let rows = csvData.trim().split('\n');

// Remove spaces at the end of each row
rows = rows.map(row => row.trim());

// Añadir la nueva columna al encabezado de photo_url
rows[0] += ',photo_url';

// Identificar las filas con rating 5 y barajar las imágenes
let imageRows = [];
for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(',');
    if (parseInt(columns[1]) === 5) { // Rating de 5 estrellas
        imageRows.push(i);
    }
}

// Barajar las imágenes
const shuffledImages = image_urls.sort(() => 0.5 - Math.random());

// Asignar imágenes a filas aleatorias con rating 5 y añadir un campo vacío a otras filas
let imageIndex = 0;
for (let i = 1; i < rows.length; i++) {
    if (imageRows.includes(i) && imageIndex < shuffledImages.length) {
        rows[i] += `,${shuffledImages[imageIndex]}`;
        imageIndex++;
    } else {
        rows[i] += ',';
    }
}

// Añadir la nueva columna de verified_purchase
rows[0] += ',verified_purchase';
for (let i = 1; i < rows.length; i++) {
    rows[i] += ',true';
}

// Convertir las filas en una cadena de texto CSV
csvData = rows.join('\n');

// Guardar el archivo CSV actualizado
const filePath = path.join(__dirname, 'reviews_with_images.csv');

fs.writeFile(filePath, csvData, (err) => {
    if (err) {
        console.error('Error al escribir el archivo CSV:', err);
    } else {
        console.log('Archivo CSV con imágenes guardado exitosamente en:', filePath);
    }
});
