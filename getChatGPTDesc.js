const axios = require('axios');
require('dotenv').config();

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
    console.log('Generated Output:', completionText);
    return completionText;
  } catch (error) {
    console.error('Error generating product data:', error);
  }
}

module.exports = { generateProductData };