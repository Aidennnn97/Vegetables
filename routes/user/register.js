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
      fs.mkdir('public/images', function (err) {
        if (err && err.code != 'EEXIST') {
          // console.log("already exist")
        } else {
          callback(null, 'public/images');
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

router.get('/', function(req, res, next) {
  let route = req.app.get('views') + '/register';
  res.render(route);
});

async function insertProduct(params) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "INSERT INTO product(product_no, product_name, product_content, product_cnt, product_price, product_date, product_img, product_reg) VALUES((SELECT NVL(MAX(product_no), 0)+1 FROM product), :prdtname, :prdtcontent, :prdtcount, :prdtprice, TO_DATE(:prdtdate, 'yyyy-MM-dd HH:mi:ss'), :prdtimg, TO_DATE(SYSDATE, 'yyyy-MM-dd HH:mi:ss'))";

  await connection.execute(sql, params, options);

  await connection.close();
  
}

router.post('/insert', upload.single('prdtImg'), async function(req, res){
  const params = [req.body.prdtName, req.body.prdtContent, req.body.prdtCnt, req.body.prdtPrice, req.body.prdtDate, req.file.path];

  console.log(params);


  await insertProduct(params);

  res.send("<script>alert('상품등록 성공.'); location.href='/home'</script>");
});

module.exports = router;
