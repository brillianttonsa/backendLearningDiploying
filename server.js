import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {
        title: 'My Shopping List',
        items: ['Apples', 'Milk', 'Bread']
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// This is a simple Express server that listens on a specified port and responds with "Hello, World!" when accessed at the root URL.