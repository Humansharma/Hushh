const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/personal_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the data schema
const userDataSchema = new mongoose.Schema({
  name: String,
  age: Number,
  // Add more fields as needed
});

const UserData = mongoose.model('UserData', userDataSchema);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/search', async (req, res) => {
  const query = req.body.query;
  const results = await UserData.find({ name: { $regex: query, $options: 'i' } });

  // Use Google Custom Search API to get search results
  try {
    const googleApiKey = 'YOUR_GOOGLE_API_KEY'; // Replace with your Google API Key
    const cx = 'YOUR_CUSTOM_SEARCH_ENGINE_ID'; // Replace with your Custom Search Engine ID
    const googleResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: googleApiKey,
        cx,
        q: query,
      },
    });

    const googleResults = googleResponse.data.items || [];
    const combinedResults = [...results, ...googleResults];

    // Sort combined results by views or any other relevant metric
    combinedResults.sort((a, b) => (a.views || 0) - (b.views || 0)).reverse();

    res.json(combinedResults);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
