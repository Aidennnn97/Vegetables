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

// 결제페이지로 이동
router.post('/', async function(req, res) {
  const cartChk = JSON.parse("[" + req.body.cartChk + "]");
  console.log(cartChk);
  const buyProduct = await selectCartProduct(cartChk);
  var sumPrice = 0;
  for(i=0; i < buyProduct.length; i++){
    sumPrice += buyProduct[i].SUM_PRICE;
  }
  res.render('payment', {buyProduct : buyProduct, sumPrice : sumPrice });
});

// 결제 후 구매요청
router.post('/buyProduct',  async function(req, res) {

  const params = [req.body.order_name, req.body.order_phone, req.body.get_name, req.body.get_phone, req.body.get_addr, req.body.get_addr_detail];
  console.log(params);

  res.send("<script>alert('정상적으로 등록이 완료되었습니다.');location.href='/home'</script>");
});

module.exports = router;
