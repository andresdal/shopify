const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateProductData(language, description, price, compare_at_price) {
  try {
    const messages = [
    {
        role: "user",
        content: `Generate a json in language${language} based on this input:
    ${description}
    The output should look like: 
    product: {
        title: 'Xiaomi 12 Bone Solid color Automatic umbrella Light Collapsible Large size sunshade Uv protection',
        body_html: 'Xiaomi 12 Bone Solid color Automatic umbrella Light Collapsible Large size sunshade Uv protection',
        vendor: 'My Shop',
        product_type: 'Umbrella',
        tags: 'xiaomi, umbrella, collapsible, large size, sunshade, uv protection',
        variants: [
            {
            price: '${price}',
            compare_at_price: '${compare_at_price}',
            sku: 'Xiaomi-umbrella',
            }
        ]
        }
    Replace the title (title generated), body_html (description generated), product_type, tags and sku. Keep the price, compare_at_price and vendor as they are.
    The only output should be the json, nothing else. 
    The description generated should be in the body_html and must be in html format. For example: <p style="text-align: center;"><img src="https://cdn.shopify.com/s/files/1/0661/8864/0441/files/newone.svg?v=1721098019" alt="" width="356" height="35" style="display: block; margin-left: auto; margin-right: auto;" data-mce-src="https://cdn.shopify.com/s/files/1/0661/8864/0441/files/newone.svg?v=1721098019"><strong></strong></p>
<p><strong><img alt="" src="https://cdn.shopify.com/s/files/1/0836/6918/8941/files/fhipinng.png" width="351" height="73" style="display: block; margin-left: auto; margin-right: auto;"></strong></p>
    <p>Αναβαθμίστε την άνεση του σπιτιού σας με τον AirFusion Έξυπνο 3-σε-1 Επαγγελματικό Ανεμιστήρα Οροφής. Με κομψό σχεδιασμό, τηλεχειριστήριο και 3 ταχύτητες, αυτός ο ανεμιστήρας προσφέρει ιδανική κυκλοφορία αέρα και ρυθμιζόμενο φωτισμό. Ιδανικό για υπνοδωμάτια και σαλόνια, συνδυάζει λειτουργικότητα με στυλ.</p>
    <ul>
    <li>💨 3 ταχύτητες ανεμιστήρα για προσαρμοσμένη ροή αέρα</li>
    <li>🌟 Ενσωματωμένη βάση φωτισμού για πολυδιάστατο φωτισμό</li>
    <li>📱 Βολικό τηλεχειριστήριο για εύκολες ρυθμίσεις</li>
    <li>🏠 Ιδανικό για υπνοδωμάτια και σαλόνια</li>
    <li>🔌 Συμβατότητα AC85-265V για ευέλικτη εγκατάσταση</li>
    </ul>
    <p>Παραγγείλετε τώρα και επωφεληθείτε από μια ειδική έκπτωση! Μην χάσετε αυτή την ευκαιρία να βελτιώσετε την άνεση του σπιτιού σας.</p>. 
    Create a compelling product description based on the information below, including an innovative product name. The structure should be: Title, a description of about 300 characters, up to 5 bullet points with different emojis, and a CTA to order now with a special discount. The result should be ready to copy and paste, with no extra titles. Do not include emojis in the title. 
    All the output text should be in language ${language}, including the title.
    The price must be ${price} and the compare_at_price must be ${compare_at_price}.
    dont add the \`\`\`json\`\`\`, just give me the plain text`
    }
    ];
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini', // Specify the model
      messages,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract and log the completion content
    const completionText = response.data.choices[0].message.content;
    // console.log('Generated Output:', completionText);
    return completionText;
  } catch (error) {
    console.error('Error generating product data:', error);
  }
}

async function generateProductReviews(product_handle, language, country, product_title, image_urls) {
  // generate random number between 10 and 30
  const cant_reviews = Math.floor(Math.random() * 21) + 10;

  // get actual date
  const date = new Date();
  dateNow = date.toISOString().split('T')[0];
  dateYesterday = date.setDate(date.getDate() - 1);

  date.setMonth(date.getMonth() - 1);
  datePrevMonth = date.toISOString().split('T')[0];
  
  try {
    const messages = [
    {
        role: "user",
        content: `Generate a csv in language ${language} that has the following columns:
        product_handle, rating, author, email, body, created_at

        create ${cant_reviews} rows
        the product_handle must be ${product_handle} always
        the rating must be between 3 and 5. Make the average rating 4.x
        the author must be a random name from ${country}
        the email must be a random email
        the body must be a random review of aprox 150 characters. Talk about the product, other just generic ones. include emojis on some of them. dont add stars nor bulleted list, just plain text. The product title is ${product_title}. Put the body text beetween commas "".
        the created_at must have this format: YYYY-MM-DD hh:mm:ss UTC. The dates must be between ${datePrevMonth} and ${dateYesterday}

        dont add the \`\`\`csv\`\`\`, just give me the plain text`
    }
    ];
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini', // Specify the model
      messages,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract and log the completion content
    let csvData = response.data.choices[0].message.content;
    // console.log('Generated Output:', csvData);

    // Dividir el texto en filas
    let rows = csvData.trim().split('\n');

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

    csvData = rows.join('\n');
    
    // Ruta donde se guardará el archivo CSV
    const filePath = path.join(__dirname, 'reviews.csv');

    // Escribir el archivo CSV
    fs.writeFile(filePath, csvData.trim(), (err) => {
        if (err) {
            console.error('Error al escribir el archivo CSV:', err);
        } else {
            console.log('Archivo CSV guardado exitosamente en:', filePath);
        }
    });
  } catch (error) {
    console.error('Error generating product review data:', error);
  }
}

module.exports = { generateProductData, generateProductReviews };