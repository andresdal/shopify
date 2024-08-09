require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const mime = require('mime-types');
const path = require('path');

const shopifyDomain = process.env.SHOPIFY_DOMAIN;
const accessToken = process.env.ACCESS_TOKEN;
const imagePath = './temp_product_media/image-1.webp';

if (!shopifyDomain || !accessToken) {
  console.error('SHOPIFY_DOMAIN or ACCESS_TOKEN is not defined');
  process.exit(1);
}

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

const main = async () => {
  try {
    const resourceUrl = await uploadImage(imagePath);
    console.log(`Image uploaded: ${resourceUrl}`);

    const file = await createFileInShopify(resourceUrl);
    console.log(`File created in Shopify: ${JSON.stringify(file)}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

main();
