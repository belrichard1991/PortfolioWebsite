// Basic Node.js + Express Portfolio Site
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('Public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Fake credentials (use DB later)
const USER = {
  username: 'admin',
  password: 'admin'
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts. Please try again later.',
});

// Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.status(401).send('<script>alert("Invalid credentials."); window.location.href="/login";</script>');
  }
});

app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, '/views/admin.html'));
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


// Set up basic routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/Public/index.html'));
  console.log("__dirname:", __dirname);
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '/Public/projects.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '/Public/about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '/Public/contact.html'));
});

app.post('/contact', async  (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bel.richard11@gmail.com',
      pass: 'eude nwzh efwz fudi'
    }
  });

  const mailOptions = {
    from: email,
    to: 'bel.richard11@gmail.com',
    subject: `Message from ${name}`,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/contact?success=true');
  } catch (error) {
    console.error('Error sending email:', error);
    res.redirect('/contact?success=false');
  };
});


app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
