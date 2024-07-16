const express = require('express');
const productoController = require('../controllers/productoController');

const router = express.Router();

//vista para listar productos
router.get('/productos', productoController.renderProducto)

//vista para agregar productos
router.get('/add-productos', productoController.register)

//insrtar productos
router.post('/storeproducto', productoController.insertProducto)

//Borrar
router.post('/delete/:id', productoController.deleteProducto)

//Ruta para editar
router.get('/edit/:id', productoController.getProduct)

//Editar producto
router.post('/edit/:id', productoController.updateProducto)

//Ver
router.get('/read/:id', productoController.readProduct)




module.exports = router;