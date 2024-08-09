const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateProductData(language, description) {
  try {
    const messages = [
    {
        role: "user",
        content: `Generate a json in ${language} based on this input:
    ${description}
    The output should look like: 
    product: {
        title: 'Xiaomi 12 Bone Solid color Automatic umbrella Light Collapsible Large size sunshade Uv protection',
        body_html: 'Xiaomi 12 Bone Solid color Automatic umbrella Light Collapsible Large size sunshade Uv protection',
        vendor: 'Smile Shop',
        product_type: 'Umbrella',
        tags: 'xiaomi, umbrella, collapsible, large size, sunshade, uv protection',
        variants: [
            {
            price: '19.99',
            compare_at_price: '29.99',
            sku: 'Xiaomi-umbrella',
            }
        ]
        }
    Replace the title (title generated), body_html (description generated), product_type, tags and sku. Keep the price, compare_at_price and vendor as they are.
    The only output should be the json, nothing else. 
    The description generated should be in the body_html. 
    Create a compelling product description based on the information below, including an innovative product name. The structure should be: Title, a description of about 300 characters, up to 5 bullet points with different emojis (use one \\n to leave a line between them), and a CTA to order now with a special discount. The result should be ready to copy and paste, with no extra titles. Do not include emojis in the title. 
    All the output text should be in ${language}.
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