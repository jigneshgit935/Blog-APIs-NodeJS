const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8000;
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const blogsRoutes = require('./routes/blogsRoutes');

require('dotenv').config();
require('./db');

app.use(cors());
app.use(bodyParser.json());

app.use('/users', authRoutes);
app.use('/blogs', blogsRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to blog api',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at port  ${PORT}`);
});
