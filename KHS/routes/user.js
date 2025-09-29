const express = require('express');
const path = require('path');
const router = express.Router();
router.use(express.json());

// 임시 DB
let db = new Map();

router
    .route('/')
    .get((req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
});

router
    .route('/login')
    .get((req, res) => {
        res.sendFile(path.join(__dirname, 'login.html'));
    })
    .post((req, res) => {
        const {id, pwd} = req.body;
        const emptyText = (!id || !pwd);
        if(emptyText) {
            res.status(400).json({
            message: `${emptyText} 내용을 입력해주세요.`
            });
        }

        const idRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!idRegex.test(id)) {
            res.status(400).json({
            message: "아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const pwdRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!pwdRegex.test(pwd)) {
            res.status(400).json({
            message: "비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        //TODO: DB에 id, pwd 있는지 확인하는 로직 추가
        const isUserFound = db.find((e) => {
            e.id === id && e.pwd === pwd
        });

        if(!isUserFound) {
            res.status(404).json({
            message: "존재하지 않는 아이디 혹은 비밀번호 입니다. 다시 입력해주세요."
            });
        }

        res.status(201).json({
            message: "로그인 성공!"
        });
    });

router.route('/register')
    .get((req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
    })
    .post((req, res) => {
        const {name, id, pwd, confirm_pwd, nickName} = req.body;
        console.log(req.body);
        console.log(name, id, pwd, confirm_pwd, nickName);
        const emptyText = (!name || !id || !pwd || !confirm_pwd || !nickName);
        if(emptyText) {
            res.status(400).json({
            message: `${emptyText} 내용을 입력해주세요.`
            });
        }

        const nameRegex = /^[가-힣]{2,6}$/;
        if(!nameRegex.test(name)) {
            res.status(400).json({
            message: "이름은 2~6자 이내의 한글로 입력해주세요."
            });
        }

        const idRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!idRegex.test(id)) {
            res.status(400).json({
            message: "아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const pwdRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!pwdRegex.test(pwd)) {
            res.status(400).json({
            message: "비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,6}$/;
        if(!nicknameRegex.test(nickName)) {
            res.status(400).json({
            message: "닉네임은 1~4자 이내의 영어 대소문자나 숫자, 한글로 입력해주세요."
            });
        }

        if(pwd !== confirm_pwd) {
            res.status(400).json({
            message: "비밀번호가 일치하지 않습니다. 다시 입력해주세요."
            });
        }

        //TODO: DB에 존재하는 id일 때 예외처리
        //TODO: name, id, pwd, confirm_pwd, nickname 받아서 DB에 저장
        db.set(user_id++, {
            name: name,
            id: id,
            pwd: pwd,
            nickName: nickName
        });

        res.status(201).json({
            message: "회원가입 성공!"
        });
    });

router.route('/password')
    .get((req, res) => {
    res.sendFile(path.join(__dirname, 'password.html'));
    })
    .post((req, res) => {
        const {id, pwd, confirm_pwd} = req.body;
        console.log(req.body);
        console.log(id, pwd, confirm_pwd);
        const emptyText = (!id || !pwd || !confirm_pwd);
        if(emptyText) {
            res.status(400).json({
            message: `${emptyText} 내용을 입력해주세요.`
            });
        }

        const idRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!idRegex.test(id)) {
            res.status(400).json({
            message: "아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const pwdRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!pwdRegex.test(pwd)) {
            res.status(400).json({
            message: "비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        if(pwd !== confirm_pwd) {
            res.status(400).json({
            message: "비밀번호가 일치하지 않습니다. 다시 입력해주세요."
            });
        }

        //TODO: DB에 존재하지 않는 id일 때 예외처리
        //TODO: DB에 저장됨 id와 일치하는 계정의 pwd를 수정
        const isUserFound = db.find((e) => {
            e.id === id
        });

        if(isUserFound) {
            db.set(db.get(isUserFound), );
        }

        db.set(id, {
            name: name,
            pwd: pwd,
            nickName: nickName
        });

        res.status(201).json({
            message: "회원가입 성공!"
        });
    });

module.exports = router;