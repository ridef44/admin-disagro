const pool = require('../helpers/db');  

function renderProducto(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  let searchQuery = req.query.search || '';
  let searchCondition = '';
  let queryParams = [];

  if (searchQuery) {
    searchCondition = ' WHERE name ILIKE $1';
    queryParams.push(`%${searchQuery}%`);
  }

  pool.query(`SELECT * FROM productos${searchCondition}`, queryParams, (err, result) => {
    if (err) {
      return res.json(err);
    }
    let name = req.session.nombre;
    res.render('producto/listProducto', { producto: result.rows, name, searchTerm: searchQuery });
  });
}

//Funciones para renderizar vista de creacion de usuari9os

function register(req, res) {
  let correo = req.session.correo;
  if (!req.session.loggedIn || correo !== process.env.MAIL_ADMIN) {
    return res.redirect('/');
  }

  let name = req.session.nombre;
  res.render('producto/addProducto', { name, correo });

}

//creacion de productos
function insertProducto(req, res) {
  const { type, name, price } = req.body;

  // Validación básica
  if (!type || !name || !price) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const queryText = `
    INSERT INTO productos (type, name, price, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW());
  `;
  const values = [type, name, parseFloat(price)];

  pool.connect()
    .then(client => 
      client.query(queryText, values)
        .then(() => {
          client.release();
          res.redirect('/productos');
        })
        .catch(err => {
          client.release();
          console.error('Error insertando el producto', err);
          res.status(500).json({ error: 'Error al registrar el producto' });
        })
    )
    .catch(err => {
      console.error('Error conectándose a la base de datos', err);
      res.status(500).json({ error: 'Error al conectar con la base de datos' });
    });
}


//Borrar producto
function deleteProducto(req, res) {
  const id = req.params.id;

  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error conectándose a la base de datos', err);
      return res.status(500).send('Error de servidor');
    }

    const queryText = 'DELETE FROM productos WHERE id = $1'; // Asegúrate de que la tabla se llama 'users' y no 'user'
    
    client.query(queryText, [id], (err, result) => {
      release();
      if (err) {
        console.error('Error ejecutando la consulta', err);
        return res.status(500).send('Error de servidor');
      }

      setTimeout(() => {
        res.redirect('/productos');
      }, 3000);
    });
  });
}

//renderiza los productos para renderizarlo en el form
function getProduct(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  const id = req.params.id;

  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error conectándose a la base de datos', err);
      return res.status(500).send('Error del servidor');
    }

    const queryText = 'SELECT * FROM productos WHERE id = $1';
    
    client.query(queryText, [id], (err, result) => {
      release();
      if (err) {
        console.error('Error al consultar la base de datos', err);
        return res.status(500).send('Error al consultar la base de datos');
      }

      if (result.rows.length === 0) {
        // Manejar el caso donde no se encontraron registros
        return res.status(404).send('Producto no encontrado');
      }

      const producto = result.rows[0];
      let name = req.session.nombre;
      res.render('producto/editProducto', { producto, name });
    });
  });
}

//actualizar producto

function updateProducto(req, res) {
  const { id, type, name, price } = req.body;

  // Validación básica
  if (!id || !type || !name || !price) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const queryText = `
    UPDATE productos
    SET type = $1, name = $2, price = $3, "updatedAt" = NOW()
    WHERE id = $4;
  `;
  const values = [type, name, parseFloat(price), id];

  pool.connect()
    .then(client => 
      client.query(queryText, values)
        .then(() => {
          client.release();
          res.redirect('/productos');
        })
        .catch(err => {
          client.release();
          console.error('Error actualizando el producto', err);
          res.status(500).json({ error: 'Error al actualizar el producto' });
        })
    )
    .catch(err => {
      console.error('Error conectándose a la base de datos', err);
      res.status(500).json({ error: 'Error al conectar con la base de datos' });
    });
}


//renderiza los productos para renderizarlo en el form
function readProduct(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  const id = req.params.id;

  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error conectándose a la base de datos', err);
      return res.status(500).send('Error del servidor');
    }

    const queryText = 'SELECT * FROM productos WHERE id = $1';
    
    client.query(queryText, [id], (err, result) => {
      release();
      if (err) {
        console.error('Error al consultar la base de datos', err);
        return res.status(500).send('Error al consultar la base de datos');
      }

      if (result.rows.length === 0) {
        // Manejar el caso donde no se encontraron registros
        return res.status(404).send('Producto no encontrado');
      }

      const producto = result.rows[0];
      let name = req.session.nombre;
      res.render('producto/readProducto', { producto, name });
    });
  });
}

  module.exports ={
    readProduct,
    updateProducto,
    getProduct,
    deleteProducto,
    insertProducto,
    renderProducto,
    register
  }