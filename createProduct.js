const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
const mime = require('mime-types');

// const shopifyDomain = process.env.SHOPIFY_DOMAIN;
// const accessToken = process.env.ACCESS_TOKEN;
const logFilePath = path.join(__dirname, 'script.log');

// Función para escribir en el archivo de log
const logToFile = (message) => {
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
};


// Función para subir una imagen a Shopify
const createStagedUploads = async (filename, mimeType, shopify_domain, shopify_token) => {
  const endpoint = `https://${shopify_domain}/admin/api/2024-07/graphql.json`;
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
      'X-Shopify-Access-Token': shopify_token,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data.stagedUploadsCreate.stagedTargets[0];
};

const uploadImage = async (imagePath, shopify_domain) => {
  const filename = path.basename(imagePath);
  const mimeType = mime.lookup(filename) || 'application/octet-stream';
  const stagedUpload = await createStagedUploads(filename, mimeType, shopify_domain, shopify_token);

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

const createFileInShopify = async (resourceUrl, shopify_token) => {
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
      'X-Shopify-Access-Token': shopify_token,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data.fileCreate.files[0];
};

// Función para subir todas las imágenes desde una carpeta
const uploadImagesFromFolder = async (folderPath, shopify_domain, shopify_token) => {
  const files = fs.readdirSync(folderPath);
  const imagePaths = files.map(file => path.join(folderPath, file));
  
  const imageUrls = [];
  for (const imagePath of imagePaths) {
    const resourceUrl = await uploadImage(imagePath, shopify_domain, shopify_token);
    console.log(`Image uploaded: ${resourceUrl}`);

    const file = await createFileInShopify(resourceUrl, shopify_token);
    console.log(`File created in Shopify: ${JSON.stringify(file)}`);

    imageUrls.push(resourceUrl);
  }

  return imageUrls;
};

const addImagesToProduct = (productJson, imageUrls) => {
  // Verifica el tipo y la estructura del JSON
  if (!productJson || typeof productJson !== 'object') {
      throw new Error('Invalid product JSON: productJson is not an object');
  }
  if (!productJson.product) {
      throw new Error('Invalid product JSON: Missing "product" key');
  }

  // Verifica que imageUrls sea un array
  if (!Array.isArray(imageUrls)) {
      throw new Error('Image URLs should be an array');
  }

  // Agregar el campo images al JSON del producto
  productJson.product.images = imageUrls.map(url => ({ src: url }));

  return productJson;
};

// Función para crear un producto en Shopify
const createProduct = async (imageUrls, producto_json, shopify_domain, shopify_token) => {
  console.log("images Urls llegaron: " + imageUrls);
  
  producto_json = JSON.parse(producto_json);

  let productData = addImagesToProduct(producto_json, imageUrls);

  console.log("Producto JSON con imagenes:", JSON.stringify(productData));

  try {
    const response = await axios.post(`https://${shopify_domain}/admin/api/2024-07/products.json`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': shopify_token
      }
    });
    const productId = response.data.product.id;
    logToFile(`Producto creado con ID: ${productId}`);
    return productId;
  } catch (error) {
    logToFile(`Error al crear el producto: ${error}`);
  }
};
module.exports = { uploadImagesFromFolder, createProduct, logToFile};