var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');
const {
    ORACLE_CONFIG
} = require("../../config/db");

//유저정보
async function selectMemberInfo(userId) {

    let connection = await oracledb.getConnection(ORACLE_CONFIG);
  
    let binds = {};
    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
      };
    var sql = "SELECT member_name, member_addr1, member_addr2, member_addr1 ||' '||member_addr2 AS full_addr FROM member WHERE member_id = '" + userId + "'";
  
    let result = await connection.execute(sql, binds, options);
  
    //console.log(result.rows);
    
    await connection.close();
    
    return result.rows[0];
  }

router.get('/', async function(req, res, next) {
    const userId = req.session.user.sessionId;
    memberInfo = await selectMemberInfo(userId);
    res.render('header', { member: memberInfo });
  });

  module.exports = router;