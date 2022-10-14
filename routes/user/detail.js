var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");

// 등록된 상품정보
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

// 등록된 상품의 이미지 여러개
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

// 상품 등록한 유저정보
async function selectUserInfo(prdtNo){
  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "SELECT * FROM member WHERE member_no = (SELECT member_no FROM product WHERE product_no = :prdtNo)";

  let result = await connection.execute(sql, [prdtNo], options);

  //console.log(result.rows);
  
  await connection.close();
  
  return result.rows[0];
}

// 상품 클릭시 조회수 증가
async function addProductView(prdtNo){
  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "UPDATE product SET product_views = product_views + 1 WHERE product_no = :prdtNo";

  await connection.execute(sql, [prdtNo], options);

  await connection.close();
  
}


router.get('/', async function(req, res) {
  const prdtNo = req.query.prdtNo == undefined ? 1 : req.query.prdtNo;
  info = await selectProductInfo(prdtNo);
  imgs = await selectImgList(prdtNo);
  user = await selectUserInfo(prdtNo);
  await addProductView(prdtNo);
  res.render('detail', { info: info, imgs: imgs, user: user });
});

// 장바구니 물품 추가
async function addCart(params) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "INSERT INTO cartproduct VALUES((SELECT NVL(MAX(cartproduct_no), 0)+1 FROM cartproduct), :cnt, :userNo, :prdtNo)";

  await connection.execute(sql, params, options);

  await connection.close();
  
}

router.post('/', async function(req, res){
  const prdtNo = req.query.prdtNo == undefined ? 1 : req.query.prdtNo;
  const params = [req.body.cnt, sessionNo, prdtNo];
  // console.log(params);
  await addCart(params);
  res.send("<script>alert('장바구니담기 성공.'); location.href = document.referrer;</script>");
});

module.exports = router;
