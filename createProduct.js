const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
const mime = require('mime-types');

const shopifyDomain = process.env.SHOPIFY_DOMAIN;
const accessToken = process.env.ACCESS_TOKEN;
const logFilePath = path.join(__dirname, 'script.log');

// Función para escribir en el archivo de log
const logToFile = (message) => {
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
};


// Función para subir una imagen a Shopify
const createStagedUploads = async (filename, mimeType) => {
  const endpoint = `https://${shopifyDomain}/admin/api/2024-07/graphql.json`;
  const query = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
      }
    }
  `;
  const variables = {
    input: [
      {
        filename,
        mimeType,
        httpMethod: 'POST',
        resource: 'IMAGE'
      }
    ]
  };

  const response = await axios.post(endpoint, {
    query,
    variables
  }, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data.stagedUploadsCreate.stagedTargets[0];
};

const uploadImage = async (imagePath) => {
  const filename = path.basename(imagePath);
  const mimeType = mime.lookup(filename) || 'application/octet-stream';
  const stagedUpload = await createStagedUploads(filename, mimeType);

  const form = new FormData();
  stagedUpload.parameters.forEach(param => {
    form.append(param.name, param.value);
  });
  form.append('file', fs.createReadStream(imagePath));

  await axios.post(stagedUpload.url, form, {
    headers: {
      ...form.getHeaders()
    }
  });

  return stagedUpload.resourceUrl;
};

const createFileInShopify = async (resourceUrl) => {
  const endpoint = `https://${shopifyDomain}/admin/api/2024-07/graphql.json`;
  const query = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          fileStatus
          alt
          createdAt
        }
      }
    }
  `;
  const variables = {
    files: [
      {
        alt: 'fallback text for an image',
        contentType: 'IMAGE',
        originalSource: resourceUrl
      }
    ]
  };

  const response = await axios.post(endpoint, {
    query,
    variables
  }, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data.fileCreate.files[0];
};

// Función para subir todas las imágenes desde una carpeta
const uploadImagesFromFolder = async (folderPath) => {
  const files = fs.readdirSync(folderPath);
  const imagePaths = files.map(file => path.join(folderPath, file));
  
  const imageUrls = [];
  for (const imagePath of imagePaths) {
    const resourceUrl = await uploadImage(imagePath);
    console.log(`Image uploaded: ${resourceUrl}`);

    const file = await createFileInShopify(resourceUrl);
    console.log(`File created in Shopify: ${JSON.stringify(file)}`);

    imageUrls.push(resourceUrl);
  }

  return imageUrls;
};

// Función para crear un producto en Shopify
const createProduct = async (imageUrls) => {
  const productData = {
    product: {
      title: 'Xiaomi 12 Bone Solid color Automatic umbrella Light Collapsible Large size sunshade Uv protection',
      body_html: 'Xiaomi 12 Bone Solid color Automatic umbrella Light Collapsible Large size sunshade Uv protection',
      vendor: 'Smile Shop',
      product_type: 'Umbrella',
      tags: 'xiaomi, umbrella, collapsible, large size, sunshade, uv protection',
      variants: [
        {
          price: '19.99',
          sku: 'Xiaomi-umbrella',
          option1: 'One Size',
          inventory_quantity: 75
        }
      ],
      images: imageUrls.map(url => ({ src: url })) // Añade las URLs de las imágenes
    }
  };

  try {
    const response = await axios.post(`https://${shopifyDomain}/admin/api/2024-07/products.json`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });
    const productId = response.data.product.id;
    logToFile(`Producto creado con ID: ${productId}`);
    return productId;
  } catch (error) {
    logToFile(`Error al crear el producto: ${error}`);
    throw error;
  }
};

const folderPath = './temp_product_media'; // Reemplaza con la ruta a tu carpeta de imágenes

// Primero sube las imágenes y luego crea el producto con esas imágenes
uploadImagesFromFolder(folderPath)
  .then(imageUrls => createProduct(imageUrls))
  .catch(error => logToFile(`Error en el script: ${error}`));
