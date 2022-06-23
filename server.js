const express = require('express');

// INIT SERVER
const PORT = 3000;
const app = express();

app.use(express.static('src')); // Load static files (css)

// GET request
app.get('/*', (req, res) => {
    res.sendFile(`${__dirname}/src/index.html`);
});

app.listen(PORT, () => console.log('App Server started at http://localhost:3000'));
