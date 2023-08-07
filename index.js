const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8000;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to blog api',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at port  ${PORT}`);
});
