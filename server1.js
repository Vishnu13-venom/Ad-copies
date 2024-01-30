const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { Configuration, OpenAIApi } = require('openai');


const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'Vishnu@123',
  port: 5432,
});

const configuration = new Configuration({
  apiKey: 'your_openai_api_key',
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(bodyParser.json()); 

app.post('/generate-ad-copies', async (req, res) => {
  try {

    const { companyName, productDescription, keywords } = req.body;


    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Generate multiple ad copy variations for ${companyName}'s ${productDescription}, incorporating the following keywords: ${keywords}`,
      max_tokens: 150, 
      n: 3, 
      stop: null,
      temperature: 0.7,
    });

    const adCopies = response.data.choices;

    
    await pool.query('INSERT INTO ad_copies (company_name, product_description, keywords, ad_copies) VALUES ($1, $2, $3, $4)', [
      companyName,
      productDescription,
      keywords,
      JSON.stringify(adCopies),
    ]);

    res.json({ adCopies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate ad copies' });
  }
});


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
