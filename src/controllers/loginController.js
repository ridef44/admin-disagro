const bcrypt = require('bcrypt');
const pool = require('../helpers/db'); 

function login(req, res) {
  if (req.session.loggedIn) {
    res.redirect('/');
    // user is logged in.
  } else {
    res.render('login/index');
    // user is not logged in.
  }
}

async function auth(req, res) {
  const data = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM "user" WHERE correo = $1', [data.correo]);
    client.release();

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        res.render('login/index', { error: 'Contraseña Incorrecta' });
      } else {
        req.session.loggedIn = true;
        req.session.nombre = user.nombre;
        req.session.rol = user.id_role;
        req.session.correo = user.correo;
        res.redirect('/');
      }
    } else {
      res.render('login/index', { error: 'Usuario NO existe' });
    }
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.render('login/index', { error: 'Error en el servidor' });
  }
}

function logout(req, res) {
  if (req.session.loggedIn) {
    req.session.destroy();
  }
  res.redirect('/');
}

module.exports = {
  login,
  auth,
  logout
};
