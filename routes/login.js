var express = require("express");
var router = express.Router();
var oracledb = require("oracledb");
const { ORACLE_CONFIG } = require("../config/db");
if (process.platform === "darwin") {
  try {
    oracledb.initOracleClient({
      libDir: process.env.HOME + "/Downloads/instantclient_19_8",
    });
  } catch (err) {
    console.error("Whoops!");
    console.error(err);
    process.exit(1);
  }
}

//로그인 페이지로 이동
router.get("/", (req, res) => {
  let route = req.app.get("views") + "/login";
  res.render(route, { layout: false });
});

//로그인
router.post("/login", async (req, res) => {
  const loginId = req.body.userId;
  const loginPwd = req.body.userPwd;

  //아이디, 비밀번호 DB 조회
  result = await selectUserDatabase(loginId, loginPwd);

  try {
    // result == undefined 이면 조회되는 id, pwd X

    if (result == undefined) {
      res.send(
        '<script>alert("아이디 또는 비밀번호를 잘못 입력했습니다."); location.href = document.referrer;</script>'
      );
    } else {
      // 조회되면

      const userName = result.MEMBER_NAME;
      const userNo = result.MEMBER_NO;
      const userAddr1 = result.MEMBER_ADDR1;
      const userAddr2 = result.MEMBER_ADDR2;
      // 일반회원 ,관리자회원 판단
      if (result.MEMBER_AUTH == "관리자") {
        if (req.session.user) {
          //session 있으면
          res.redirect("/admin/main");
        } else {
          //session 없으면 생성

          req.session.user = {
            sessionId: loginId,
            sessionNo: userNo,
            sessionName: userName,
            sessionAddr1: userAddr1,
            sessionAddr2: userAddr2,
          };
          res.redirect("/admin/main");
        }
      } else if (result.MEMBER_AUTH == "일반회원") {
        if (req.session.user) {
          //session 있으면

          res.redirect("/user/home");
        } else {
          //session 없으면

          req.session.user = {
            sessionId: loginId,
            sessionNo: userNo,
            sessionName: userName,
            sessionAddr1: userAddr1,
            sessionAddr2: userAddr2,
          };
          res.redirect("/user/home");
        }
      }
    }
  } catch (error) {
    console.log(error.messages);
  }
});

//로그아웃
router.get("/logout", async (req, res) => {
  if (req.session.user) {
    req.session.destroy(function (err) {
      if (err) throw err;
      res.send(
        "<script>alert('로그아웃 되었습니다.'); location.href='/'</script>"
      );
    });
  } else {
    res.redirect("/");
  }
});

//select
async function selectUserDatabase(loginId, loginPwd) {
  try {
    let connection = await oracledb.getConnection(ORACLE_CONFIG);

    let sql =
      "SELECT * FROM member WHERE member_id = :id AND member_pwd = :pwd";

    let param = [loginId, loginPwd]; //조건 값
    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // query result format
    };

    let result = await connection.execute(sql, param, options);

    await connection.close();

    return result.rows[0];
  } catch (error) {
    console.log(error.messages);
  }
}
module.exports = router;
