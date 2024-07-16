const { Pool } = require('pg');

const pool = new Pool({
  user: 'admindisagro',      
  host: 'disagro-db.ctu2s4kc4s3a.us-east-2.rds.amazonaws.com',  
  database: 'develop', 
  password: 'Acc3s.BdD1sagr0', 
  port: 5432,
  ssl: {
    rejectUnauthorized: false
}
});

module.exports = pool;
