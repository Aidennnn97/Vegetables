var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");

async function selectProductInfo(prdtNo) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "SELECT * FROM product WHERE product_no = :prdtNo";

  let result = await connection.execute(sql, [prdtNo], options);

  //console.log(result.rows);
  
  await connection.close();
  
  return result.rows[0];
}

async function selectImgList(prdtNo){
  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "SELECT * FROM img WHERE product_no = :prdtNo";

  let result = await connection.execute(sql, [prdtNo], options);

  //console.log(result.rows);

  await connection.close();

  return result.rows;
}

async function selectUserInfo(prdtNo){
  
}

router.get('/', async function(req, res) {
  const prdtNo = req.query.prdtNo == undefined ? 1 : req.query.prdtNo;
  info = await selectProductInfo(prdtNo);
  imgs = await selectImgList(prdtNo);
  res.render('detail', { info: info, imgs: imgs });
});

module.exports = router;
