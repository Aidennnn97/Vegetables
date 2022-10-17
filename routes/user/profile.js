var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");

// 장바구니 조회
async function selectCart(userNo) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "SELECT * FROM cart WHERE member_no = :no";

  let result = await connection.execute(sql, [userNo], options);

  await connection.close();
  
  return result.rows;
}

// 장바구니 없는 사람들 장바구니 추가
async function insertCart(userNo) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "INSERT INTO cart VALUES(:no, :no)";

  await connection.execute(sql, [userNo], options);

  await connection.close();
  
}

// 장바구니 상품 조회
async function selectCartProduct(userNo) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "SELECT c.*, p.product_name, p.product_img, (REGEXP_REPLACE(p.product_price, ',', '')) AS product_price, (c.cartproduct_cnt * TO_NUMBER(product_price, '999,999')) AS sum_price FROM cartproduct c LEFT JOIN product p ON c.product_no = p.product_no WHERE c.cart_no = (SELECT cart_no FROM cart WHERE member_no = :no) ORDER BY c.cartproduct_no DESC";

  let result = await connection.execute(sql, [userNo], options);

  await connection.close();
  
  return result.rows;
}

// 장바구니 상품 삭제
async function deleteCartProduct(params){
  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "DELETE FROM cartproduct WHERE cartproduct_no = :cartprdtno AND cart_no = :no";

  await connection.execute(sql, params, options);

  await connection.close();
}



// 장바구니 조회 및 등록
router.get('/', async function(req, res, next) {
  // 세션에 저장된 유저정보
  const userNo = req.session.user.sessionNo;

  cart = await selectCart(userNo);

  if(cart == 0){ // 장바구니 없으면
    
    // 장바구니 생성
    await insertCart(userNo);
    
    cartProduct = await selectCartProduct(userNo);

  } else{ // 장바구니 이미 있으면

    // 장바구니 물품 조회
    cartProduct = await selectCartProduct(userNo);
  }
  
  // 총 결제금액
  var totalPrice = 0;
    for(var i = 0; i < cartProduct.length; i++){
      totalPrice += cartProduct[i].SUM_PRICE;
    }

  res.render('profile', { cartProduct: cartProduct, total: totalPrice });
});

// 장바구니 상품 삭제
router.post('/delete', async function(req, res){
  const cartprdtNo = req.query.cartprdtNo == undefined ? 1 : req.query.cartprdtNo;
  const params = [cartprdtNo, sessionNo];
  // console.log(params);
  await deleteCartProduct(params);
  res.send("<script>alert('상품삭제 성공.'); location.href='/profile'</script>");
});

module.exports = router;
