const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
const hbs = require('express-handlebars')
const session = require('express-session')
const flash = require('express-flash')
const { Validator } = require('node-input-validator')

const app = express()

// handlebars
app.engine(
  'hbs',
  hbs({
    defaultLayout: 'main',
    extname: 'hbs',
  })
)
app.set('view engine', 'hbs')

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
)

// flash
app.use(flash())

// global vars for flash
app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

// parse & encode
app.use(express.urlencoded({ extended: false }))

// routes
// @desc    welcome page
// @access  public
app.get('/', (req, res, next) => res.render('pages/welcome'))

// @desc    message processing
// @access  public
app.post('/process', async (req, res, next) => {
  const validator = new Validator(req.body, {
    nombre: 'required',
    email: 'required|email',
    telefono: 'required|phoneNumber',
    mensaje: 'required',
  })

  const matched = await validator.check()

  if (!matched) {
    for (const error in validator.errors) {
      req.flash('error', ` Verifique el campo ${error}`)
    }

    res.redirect('/')
    return
  }

  req.flash('success', 'Su mensaje se ha enviado correctamente')
  res.redirect('/')
})

// static folder
app.use(express.static(path.join(__dirname, 'public')))

app.listen(
  process.env.PORT,
  console.log(
    `Running on ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
  )
)
