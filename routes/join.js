var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../config/db");


async function insertMemberInfo(memberId, memberPwd, memberName, memberAddr1, memberAddr2) {

  let connection = await oracledb.getConnection(ORACLE_CONFIG);

  let binds = {};
  let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
  var sql = "INSERT INTO member(member_id, member_pwd, member_name, member_addr1, member_addr2) VALUES('" + memberId + "','" + memberPwd + "','" + memberName + "','" + memberAddr1 + "','" + memberAddr2 + "')";

  let result = await connection.execute(sql, binds, options);

  //console.log(result.rows);
  
  await connection.close();
  
  return result.rows;
}

router.get('/', function(req, res, next) {
  let route = req.app.get('views') + '/join';
  res.render(route);
});

router.post('/', async function(req, res){
  // console.log(req.body)
  var memberId = req.body.memberId;
  var memberPwd = req.body.memberPwd;
  var memberName = req.body.memberName;
  var memberAddr1 = req.body.memberAddr1;
  var memberAddr2 = req.body.memberAddr2;
  console.log(memberId, memberPwd, memberName, memberAddr1, memberAddr2);
  await insertMemberInfo(memberId, memberPwd, memberName, memberAddr1, memberAddr2);
  res.send("<script>alert('회원가입 성공.'); location.href='/'</script>");
})

module.exports = router;
