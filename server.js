import express from 'express';
import bcrypt from 'bcryptjs';
import pool  from './config/db.js';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 100000 }
}));
app.use(express.static('public'));

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    res.render('login');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});


app.post('/signup', async (req,res) => {
  const {username, password} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  //save to db
  try{
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, hashedPassword]);
    req.session.userId = result.rows[0].id;
  }catch (error) {
    console.error('Error saving user to database:', error);
    res.status(500).send('Internal Server Error');
    return;
  }
})

// Login page
app.get('/login', (req, res) => {
  res.render('login');
});

app.post("/login", async(req,res) => {
  const {username, password} = req.body;

  try{
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0){
      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid){
        req.session.userId = user.id;
        req.session.user = user.username;
        res.redirect("/home");
    }
    } 
  }catch(error){
    console.log(error)
  }
})

//home

app.get('/home', (req, res) => {
  if (req.session.userId) {
    console.log(req.session.userId);
    console.log(req.session.user);
    
    
    res.render('home', {name: req.session.user});
  } else {
    res.redirect('/');
  }
});


// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err){
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// This is a simple Express server that listens on a specified port and responds with "Hello, World!" when accessed at the root URL.