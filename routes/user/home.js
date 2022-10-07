var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");


//select
async function selectHotProduct() {

    let connection = await oracledb.getConnection(ORACLE_CONFIG);

    let binds = {};
    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
      };
    var sql = "SELECT product_name, product_price, product_cnt FROM product ORDER BY product_views DESC";

    let result = await connection.execute(sql, binds, options);

    // console.log(result.rows);
    
    await connection.close();
    
    return result.rows;
}

router.get('/', async function(req, res, next) {
  result = await selectHotProduct();
  res.render('home', { data: result });
});

module.exports = router;
