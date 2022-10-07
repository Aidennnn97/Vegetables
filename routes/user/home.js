var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");


//인기상품
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

//실시간등록상품
async function selectLiveProduct() {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let binds = {};
  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "SELECT product_name, product_content FROM product ORDER BY product_reg DESC";

  let result = await connection.execute(sql, binds, options);

  // console.log(result.rows);
  
  await connection.close();
  
  return result.rows;
}

//유저정보
async function selectUserInfo() {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let binds = {};
  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "SELECT member_name, member_addr1, member_addr2, member_addr1 ||' '||member_addr2 AS full_addr FROM member";

  let result = await connection.execute(sql, binds, options);

  // console.log(result.rows);
  
  await connection.close();
  
  return result;
}

router.get('/', async function(req, res, next) {
  const userId = req.session.user.sessionId;
  console.log(userId);
  hotProduct = await selectHotProduct();
  liveProduct = await selectLiveProduct();
  userInfo = await selectUserInfo();
  res.render('home', { hot: hotProduct, live: liveProduct, user: userInfo, userId: userId });
});

module.exports = router;
