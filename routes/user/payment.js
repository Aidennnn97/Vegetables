var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");

// 선택된 상품 가져오기
async function selectCartProduct(cartChk) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);
  
  var sql = "SELECT cp.*, p.product_name, (TO_NUMBER(p.product_price, '999,999') * cp.cartproduct_cnt) AS sum_price, p.product_img FROM cartproduct cp LEFT JOIN product p ON cp.product_no = p.product_no WHERE cartproduct_no = :cartChk ";

  if(cartChk.length > 1){
    for(j=0; j<cartChk.length-1; j++){
      sql += " OR cartproduct_no = :cartChk";
    }
  }

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  let result = await connection.execute(sql, cartChk, options)
  
  await connection.close();

  return result.rows;

}

// 결제 완료된 장바구니상품 제거
async function deleteCartProduct(cartProductNo) {

    let connection = await oracledb.getConnection(ORACLE_CONFIG);

    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
    var sql = "DELETE FROM cartproduct WHERE cartproduct_no = :cartprdtNo";

    if(cartProductNo.length > 1){
      for(j=0; j<cartProductNo.length-1; j++){
        sql += " OR cartproduct_no = :cartprdtNo"
      }
    }

  await connection.execute(sql, cartProductNo, options)
  
  await connection.close();

}



// 구매한 상품 수량 업데이트
async function updateProduct(cartProductNo) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
  };

  var sql = "UPDATE product SET product_cnt = product_cnt - (SELECT cartproduct_cnt FROM cartproduct WHERE cartproduct_no = :no) WHERE product_no = :no2";
  console.log(cartProductNo);
await connection.execute(sql, [cartProductNo[0], cartProductNo[0]], options);

await connection.close();
}

// 구매완료 정보 삽입
async function insertOrderlist(buyParam) {

    let connection = await oracledb.getConnection(ORACLE_CONFIG);

    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

    var sql = "INSERT INTO orderlist VALUES((SELECT NVL(MAX(orderlist_no), 0)+1 FROM orderlist), :addr, :addrDetail, :phone, :no)";

  await connection.execute(sql, buyParam, options);
  
  await connection.close();
}

// 결제페이지로 이동
router.post('/', async function(req, res) {
  const cartChk = JSON.parse("[" + req.body.cartChk + "]");
  // console.log(cartChk);
  const buyProduct = await selectCartProduct(cartChk);
  var sumPrice = 0;
  for(i=0; i < buyProduct.length; i++){
    sumPrice += buyProduct[i].SUM_PRICE;
  }
  res.render('payment', {buyProduct : buyProduct, sumPrice : sumPrice });
});

// 결제 후 구매요청
router.post('/buyProduct',  async function(req, res) {

  // 결제완료상품 삭제 데이터
  const cartProductNo = req.body.cartProductNo;

  // 상품수량 업데이트
    for(j=0; j<cartProductNo.length; j++){
      await updateProduct([cartProductNo[j]]);
    }

  // orderlist에 넣을 데이터
  const buyParam = [req.body.buyer_addr, req.body.buyer_addr_detail, req.body.buyer_phone, sessionNo];
  // console.log(buyParam);

  await insertOrderlist(buyParam);

  // console.log(cartProductNo);

  await deleteCartProduct(cartProductNo);

  res.send({msg: "결제 완료."});
});

module.exports = router;
