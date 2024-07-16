const pool = require('../helpers/db');  
const { format } = require('date-fns');


function renderView(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }

    const query = `
        SELECT 
            u.id AS usuario_id,
            u.nombre AS usuario_nombre,
            u.apellidos AS usuario_apellidos,
            u.correo AS usuario_correo,
            a.id AS asistencia_id,
            a."fechaHora",
            a."montoFinal",
            p.id AS producto_id,
            p.name AS producto_name,
            p.price AS producto_price,
            p.availability AS producto_availability,
            p.type AS producto_type
        FROM 
            "usuarios" u
        LEFT JOIN 
            "asistencias" a ON u.id = a."usuarioId"
        LEFT JOIN 
            "seleccionproductos" sp ON a.id = sp."asistenciaId"
        LEFT JOIN 
            "productos" p ON sp."productoId" = p.id
        ORDER BY 
            u.id, a.id, p.id;
    `;

    pool.query(query, (err, result) => {
        if (err) {
            return res.json(err);
        }
        let name = req.session.nombre;

        // Procesar los datos para estructurarlos adecuadamente
        const usuarios = [];
        const usuariosMap = {};

        result.rows.forEach(row => {
            // Formatear la fecha antes de agregarla al objeto
            row.fechaHora = format(new Date(row.fechaHora), 'dd MMMM yyyy, hh:mm:ss a');

            if (!usuariosMap[row.usuario_id]) {
                usuariosMap[row.usuario_id] = {
                    id: row.usuario_id,
                    nombre: row.usuario_nombre,
                    apellidos: row.usuario_apellidos,
                    correo: row.usuario_correo,
                    asistencias: []
                };
                usuarios.push(usuariosMap[row.usuario_id]);
            }

            if (row.asistencia_id) {
                let asistencia = usuariosMap[row.usuario_id].asistencias.find(a => a.id === row.asistencia_id);
                if (!asistencia) {
                    asistencia = {
                        id: row.asistencia_id,
                        fechaHora: row.fechaHora,
                        montoFinal: row.montoFinal,
                        productos: []
                    };
                    usuariosMap[row.usuario_id].asistencias.push(asistencia);
                }

                if (row.producto_id) {
                    asistencia.productos.push({
                        id: row.producto_id,
                        name: row.producto_name,
                        price: row.producto_price,
                        availability: row.producto_availability,
                        type: row.producto_type
                    });
                }
            }
        });

        res.render('asistencia/asistencia', { usuarios, name });
    });
}

module.exports = {
    renderView,
};