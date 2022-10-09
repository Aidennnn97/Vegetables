var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../config/db");
if (process.platform === 'darwin') {
    try {
      oracledb.initOracleClient({libDir: process.env.HOME + '/Downloads/instantclient_19_8'});
    } catch (err) {
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
    }
  }

//로그인 페이지로 이동
router.get('/', (req, res) => {
  let route = req.app.get('views') + '/login';
  res.render(route, { layout: false });
})

//로그인
router.post('/login', async (req, res) => {
  const auth = req.body.userId;
  result = await selectDatabase();
  // console.log(result[0].MEMBER_ID)
  // console.log(auth)
  if (auth == result[0].MEMBER_ID) {
      if (req.session.user) {
          res.redirect('/user/home');
      } else { // 세션 없는 admin일 경우 만들어줌
          req.session.user = {
              sessionId: auth
          };
          res.redirect('/user/home');
      }
  } else if(auth == null || auth == ""){
      return res.send('<script>alert("아이디 또는 비밀번호를 잘못 입력했습니다."); location.href = document.referrer;</script>');
  } else{
    if (req.session.user) {
        res.redirect('/user/home');
    } else { // 세션 없는 admin일 경우 만들어줌
        req.session.user = {
            sessionId: auth
        };
        res.redirect('/user/home');
    }
  }


});

//로그아웃
router.get('/logout', async (req, res) => {
  if (req.session.user) {
      req.session.destroy(function (err) {
          if (err) throw err;
          res.send("<script>alert('로그아웃 되었습니다.'); location.href='/'</script>");
      });
  } else {
      res.redirect('/user/home');
  }
});


//select
async function selectDatabase() {

    let connection = await oracledb.getConnection(ORACLE_CONFIG);

    let binds = {};
    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
      };

    let result = await connection.execute("select * from member where member_auth = :ID", ['user'], options);

    // console.log(result.rows);
    
    await connection.close();
    
    return result.rows
}
module.exports = router;