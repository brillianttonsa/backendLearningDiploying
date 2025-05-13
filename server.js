import express from 'express';
import bcrypt from 'bcryptjs';
import pool  from './config/db.js';
import session from 'express-session';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);



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


app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Hash the password (important!)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert into Supabase
  const { data, error } = await supabase.from('users').insert([
    { username, password: hashedPassword }
  ]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'User registered successfully', data });
});

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