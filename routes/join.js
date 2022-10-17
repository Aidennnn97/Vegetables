var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../config/db");


async function insertMemberInfo(params) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "INSERT INTO member(member_no, member_id, member_pwd, member_name, member_addr1, member_addr2, member_auth) VALUES((SELECT NVL(MAX(member_no), 0)+1 FROM member), :memberId, :memberPwd, :memberName , :memberAddr1, :memberAddr2, :memberAuth)";

  await connection.execute(sql, params, options);
  
  await connection.close();

}

router.get('/', function(req, res, next) {
  let route = req.app.get('views') + '/join';
  res.render(route, { layout: false });
});

router.post('/', async function(req, res){
  const params = [req.body.memberId, req.body.memberPwd, req.body.memberName, req.body.memberAddr1, req.body.memberAddr2, '일반회원'];
  // console.log(params);
  await insertMemberInfo(params);
  res.send("<script>alert('회원가입 성공.'); location.href='/'</script>");
})

module.exports = router;
