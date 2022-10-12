var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");

async function selectProductList() {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let binds = {};
  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "SELECT product_name, product_img FROM product ";

  let result = await connection.execute(sql, binds, options);

  // console.log(result.rows);
  
  await connection.close();
  
  return result.rows;
}

/* GET home page. */
router.get('/', async function(req, res) {
  productList = await selectProductList();
  res.render('list', { list: productList });
});

module.exports = router;
