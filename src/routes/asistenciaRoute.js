const express = require('express');
const asistenciaController = require('../controllers/asistenciaController');

const router = express.Router();

//vista para administracion
router.get('/asistencias', asistenciaController.renderView)




module.exports = router;