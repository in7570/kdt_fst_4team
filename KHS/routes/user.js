const express = require('express');
const path = require('path');
const router = express.Router();
router.use(express.json());


const mariadb = require('../database/mariadb');

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
    .post(async (req, res) => {
        const {id, pwd} = req.body;
        if (!id || !pwd) {
            return res.status(400).json({
                message: "아이디와 비밀번호를 모두 입력해주세요."
            });
        }

        const idRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!idRegex.test(id)) {
            return res.status(400).json({
                message: "아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const pwdRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!pwdRegex.test(pwd)) {
            return res.status(400).json({
                message: "비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        try {
            const sql = "SELECT * FROM users WHERE id = ?";
            const rows = await mariadb.query(sql, [id]);
            const isUserFound = (rows.length > 0);

            if(!isUserFound) {
                return res.status(404).json({
                    message: "존재하지 않는 아이디 입니다. 다시 입력해주세요."
                });
            } else {
                if(rows[0].password === pwd) {
                    return res.status(200).json({
                        message: "로그인 성공!"
                    });
                } else {
                    return res.status(404).json({
                        message: "비밀번호가 일치하지 않습니다. 다시 입력해주세요."
                    });
                }
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "서버 오류가 발생했습니다."
            });
        }

    });

router.route('/register')
    .get((req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
    })
    .post(async (req, res) => {
        const {name, id, pwd, confirm_pwd, nickName} = req.body;
        if (!name || !id || !pwd || !confirm_pwd || !nickName) {
            return res.status(400).json({
                message: "모든 항목을 입력해주세요."
            });
        }

        const nameRegex = /^[가-힣]{2,6}$/;
        if(!nameRegex.test(name)) {
            return res.status(400).json({
                message: "이름은 2~6자 이내의 한글로 입력해주세요."
            });
        }

        const idRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!idRegex.test(id)) {
            return res.status(400).json({
                message: "아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const pwdRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!pwdRegex.test(pwd)) {
            return res.status(400).json({
                message: "비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,6}$/;
        if(!nicknameRegex.test(nickName)) {
            return res.status(400).json({
                message: "닉네임은 1~4자 이내의 영어 대소문자나 숫자, 한글로 입력해주세요."
            });
        }

        if(pwd !== confirm_pwd) {
            return res.status(400).json({
                message: "비밀번호가 일치하지 않습니다. 다시 입력해주세요."
            });
        }

        try {
            let sql = "SELECT * FROM users WHERE id = ?";
            const rows = await mariadb.query(sql, id);
            if (rows.length > 0) {
                return res.status(409).json({
                    message: "이미 존재하는 아이디입니다."
                });
            }

            sql = "INSERT INTO users (id, name, password, nickname) VALUES (?, ?, ?, ?)";
            const values = [id, name, pwd, nickName];
            await mariadb.query(sql, values);
            res.status(201).json({
                message: "회원가입 성공!"
            });
        } catch (err) {
            console.error("DB 에러: err");
            return res.status(500).json({
                message: "서버 오류가 발생했습니다."
            });
        }
    });

router.route('/password')
    .get(async (req, res) => {
    res.sendFile(path.join(__dirname, 'password.html'));
    })
    .post(async (req, res) => {
        const {id, pwd, confirm_pwd} = req.body;
        console.log(req.body);
        console.log(id, pwd, confirm_pwd);
        const emptyText = (!id || !pwd || !confirm_pwd);
        if(emptyText) {
            return res.status(400).json({
                message: "내용을 모두 입력해주세요."
            });
        }

        const idRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!idRegex.test(id)) {
            return res.status(400).json({
                message: "아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        const pwdRegex = /^[a-zA-Z0-9]{3,10}$/;
        if(!pwdRegex.test(pwd)) {
            return res.status(400).json({
                message: "비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."
            });
        }

        if(pwd !== confirm_pwd) {
            return res.status(400).json({
                message: "비밀번호가 일치하지 않습니다. 다시 입력해주세요."
            });
        }

        try {
            // DB에서 사용자 확인
            let sql = "SELECT * FROM users WHERE id = ?";
            const rows = await mariadb.query(sql, id);

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "존재하지 않는 아이디입니다."
                });
            }

            // 현재 비밀번호와 새 비밀번호가 같은지 확인
            if (rows[0].password === pwd) {
                return res.status(400).json({
                    message: "동일한 비밀번호입니다. 다시 입력해주세요."
                });
            }

            // 비밀번호 업데이트
            sql = "UPDATE users SET password = ? WHERE id = ?";
            await mariadb.query(sql, [pwd, id]);

            res.status(200).json({
                message: "비밀번호가 성공적으로 변경되었습니다."
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "서버 오류가 발생했습니다."
            });
        }
    });

module.exports = router;