const express = require('express');
const exphbs = require('express-handlebars');
const pool = require('./helpers/db');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/login');
const catalogoRoutes = require('./routes/catalogoRoute');
const asistenciaRoutes = require('./routes/asistenciaRoute');
const productoRoutes = require('./routes/productosRoute')

const path = require('path');


const app = express();
app.set('port', 4000);

const dotenv = require ('dotenv');


dotenv.config({path:'.env'})

const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
      precompiled: (content, options) => {
          return content;
      },
      ifEquals: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    eq: function(a , b){
      return (a ===b);
    },
    isEven: function(index) {
      return index % 2 === 0 ? 'bg-white' : 'bg-gray-200';
    },
    
  }
});

app.engine('.hbs', hbs.engine); // Usar hbs.engine en lugar de engine()
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para añadir el pool de conexiones a cada solicitud
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}, 'single'));

// Middleware para pasar la variable de entorno MAIL_ADMIN a todas las vistas
app.use((req, res, next) => {
  res.locals.mailAdmin = process.env.MAIL_ADMIN;
  next();
});

app.listen(app.get('port'), () => {
  console.log('Estamos trabajando sobre el puerto', app.get('port'));
  // Probar la conexión al iniciar el servidor

});

//Configuracion de archivos estativos
app.use('/images', express.static(path.join(__dirname, '/views/img')));
app.use(express.static(path.join(__dirname, 'public/admin'), { index: false }));
app.use(express.static(path.join(__dirname, 'public/explorer'), { index: false }));

app.use('/', loginRoutes);
app.use('/', catalogoRoutes);
app.use('/',asistenciaRoutes);
app.use('/', productoRoutes);


app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    let rol = req.session.rol;
    let name = req.session.nombre;
    let correo = req.session.correo;
    let index = process.env.MY_DOMAIN;
    if (rol===1){
      res.render('home', {name, rol, correo, index});
    }
    else{
      res.render('catalogo/lectura', {name, rol, index});
    }
  } else {
    res.redirect('/login');
  }
});
