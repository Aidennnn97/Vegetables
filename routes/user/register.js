var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'home' });
});

async function insertProductInfo(prdtName, prdtContent, prdtCnt, prdtPrice, prdtDate) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let binds = {};
  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "INSERT INTO product(product_name, product_content, product_cnt, product_price, product_date) VALUES('" + prdtName + "','" + prdtContent + "','" + prdtCnt + "','" + prdtPrice + "','" + prdtDate + "')";

  let result = await connection.execute(sql, binds, options);

  //console.log(result.rows);
  
  await connection.close();
  
  return result.rows;
}

async function insertImgInfo(prdtImg1, prdtImg2, prdtImg3, prdtImg4) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let binds = {};
  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "INSERT INTO img(member_id, member_pwd, member_name, member_addr1, member_addr2) VALUES('" + prdtImg1 + "','" + prdtImg2 + "','" + prdtImg3 + "','" + prdtImg4 + "')";

  let result = await connection.execute(sql, binds, options);

  //console.log(result.rows);
  
  await connection.close();
  
  return result.rows;
}



router.post('/', async function(req, res){
  var prdtName = req.body.prdtName;
  var prdtContent = req.body.prdtContent;
  var prdtCnt = req.body.prdtCnt;
  var prdtPrice = req.body.prdtPrice;
  var prdtDate = req.body.prdtDate;
  var prdtImgs = req.body.prdtImgs;
  // console.log(prdtName, prdtContent, prdtCnt, prdtPrice, prdtDate, prdtImgs);
  // await insertProductInfo(prdtName, prdtContent, prdtCnt, prdtPrice, prdtDate);
  // await insertImgInfo(prdtImg1, prdtImg2, prdtImg3, prdtImg4);
  res.send("<script>alert('상품등록 성공.'); location.href='/home'</script>");
});

module.exports = router;
