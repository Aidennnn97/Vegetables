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


// 상품등록
async function insertProduct(params) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  var sql = "INSERT INTO product(product_no, product_name, product_content, product_cnt, product_price, product_date, product_img, product_reg, member_no) VALUES((SELECT NVL(MAX(product_no), 0)+1 FROM product), :prdtName, :prdtContent, :prdtCnt, TO_CHAR(:prdtPrice, '999,999'), TO_DATE(:prdtdate, 'yyyy/mm/dd'), :prdtimg, TO_CHAR(sysdate+9/24, 'yyyy/mm/dd hh24:mi:ss'), :memberNo)";

  await connection.execute(sql, params, options);

  await connection.close();
  
}

// 상품 추가사진 등록
async function insertImg(param2) {
  // console.log(param2)
  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  var sql = "INSERT INTO img(img_route, img_no, img_name, img_type, product_no) VALUES(:imgRoute, :imgNo, :imgName, :imgType, (SELECT MAX(product_no) FROM product))";

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };

  await connection.execute(sql, param2, options)
  
  await connection.close();

}

router.post('/insert', upload.array('prdtImg'), async function(req, res){
  // 파일이 저장된 경로
  const paths = req.files.map(data => data.path);

  // 파일 원본이름
  const imgName = req.files.map(data => data.originalname);

  // paths[0] : 대표사진
  const params = [req.body.prdtName, req.body.prdtContent, req.body.prdtCnt, req.body.prdtPrice, req.body.prdtDate, paths[0], sessionNo];
  await insertProduct(params);

  for(let i = 1; i < paths.length; i++){
    const param2 = [paths[i], i, imgName[i], path.extname(paths[i])];
    await insertImg(param2);
  }

  console.log(params);


  res.send("<script>alert('상품등록 성공.'); location.href='/home'</script>");
});

router.get('/', function(req, res) {
  let route = req.app.get('views') + '/register';
  res.render(route);
});

module.exports = router;
