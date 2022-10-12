var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");

// 파일 업로드
const multer = require("multer");
const path = require('path');
const fs = require('fs');

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir('public/imges', function (err) {
        if (err && err.code != 'EEXIST') {
          // console.log("already exist")
        } else {
          callback(null, 'public/imges');
        }
      })
    },
    //파일이름 설정
    filename: (req, file, done) => {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
    //파일 개수, 파일사이즈 제한
    // limits: {
    //   files: 5,
    //   fileSize: 1024 * 1024 * 1024 //1기가
    // },

})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'home' });
});

async function insertProduct(param) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let binds = {};
  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "INSERT INTO product(product_no, product_name, product_content, product_cnt, product_price, product_date, product_reg) VALUES((SELECT NVL(MAX(product_no), 0) + 1 FROM product), :name, :content, :count, :price, :date, TO_CHAR(SYSDATE, 'yyyy-MM-dd HH:mi:ss'))";

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
  const param = [req.body.prdtName,req.body.prdtContent,req.body.prdtCnt,req.body.prdtPrice,req.body.prdtDate,req.body.prdtImgs];

  console.log(param);

  res.send("<script>alert('상품등록 성공.'); location.href='/home'</script>");
});

module.exports = router;
