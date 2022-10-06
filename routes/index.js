var express = require('express');
var router = express.Router();
var oracledb = require('oracledb');

const login = require('./login.js');
const home = require('./user/home.js');
const adminMain = require('./admin/main.js');

router.use('/', (req,res,next) => {
    if(req.url == '/' || req.url == '/login') {
        // console.log("세션 검사 하지않고 로그인페이지로")
        next();
    } else {   // 로그인 페이지 이외의 페이지에 진입하려고 하는 경우
        if(req.session.user) {
            // console.log("세션이 있다.")
            next();     // user와 admin이 같은 페이지를 이용할 때 구분해줘야 할 때
        } else {
            // console.log("세션이 없다.")
            res.send("<script>alert('로그인이 필요합니다.');location.href='/'</script>");
        }
    }
});

// 로그인
router.use('/', login);

// 회원
router.use('/user/home', home);

// 관리자
router.use('/admin/main', adminMain);
module.exports = router;