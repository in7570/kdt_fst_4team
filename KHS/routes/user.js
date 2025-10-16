const express = require('express');
const path = require('path');
const router = express.Router();
const {body, param, validationResult} = require('express-validator');
router.use(express.json());


const mariadb = require('../database/mariadb');
const idRegex = /^[a-zA-Z0-9]{3,10}$/;
const pwdRegex = /^[a-zA-Z0-9]{3,10}$/;
const nameRegex = /^[가-힣]{2,6}$/;
const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,6}$/;

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
    .post([
        body('id').notEmpty().withMessage("아이디와 비밀번호를 모두 입력해주세요.").matches(idRegex).withMessage("아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."),
        body('pwd').notEmpty().withMessage("아이디와 비밀번호를 모두 입력해주세요.").matches(pwdRegex).withMessage("비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요.")
    ], async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({ errors: err.array() });
        }

        const {id, pwd} = req.body;

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
    .post([
        body('name').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(nameRegex).withMessage("이름은 2~6자 이내의 한글로 입력해주세요."),
        body('id').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(idRegex).withMessage("아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."),
        body('pwd').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(pwdRegex).withMessage("비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."),
        body('confirm_pwd').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(pwdRegex).withMessage("비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요.")
            .custom((value, { req }) => {
                if (value !== req.body.pwd) {
                    throw new Error('비밀번호가 일치하지 않습니다. 다시 입력해주세요.');
                }
                return true;
            }),
        body('nickName').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(nicknameRegex).withMessage("닉네임은 2~6자 이내의 영어 대소문자나 숫자, 한글로 입력해주세요."),
    ], async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({ errors: err.array() });
        }

        const {name, id, pwd, nickName} = req.body;

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
    .get((req, res) => {
    res.sendFile(path.join(__dirname, 'password.html'));
    })
    .post([
        body('id').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(idRegex).withMessage("아이디는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."),
        body('pwd').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(pwdRegex).withMessage("비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요."),
        body('confirm_pwd').notEmpty().withMessage("모든 항목을 입력해주세요.").matches(pwdRegex).withMessage("비밀번호는 3~10자 이내의 영어 대소문자나 숫자로 입력해주세요.")
            .custom((value, { req }) => {
                if (value !== req.body.pwd) {
                    throw new Error('비밀번호가 일치하지 않습니다. 다시 입력해주세요.');
                }
                return true;
            }),
    ], async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({ errors: err.array() });
        }
        
        const {id, pwd, confirm_pwd} = req.body;

        try {
            let sql = "SELECT * FROM users WHERE id = ?";
            const rows = await mariadb.query(sql, id);

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "존재하지 않는 아이디입니다."
                });
            }

            if (rows[0].password === pwd) {
                return res.status(400).json({
                    message: "동일한 비밀번호입니다. 다시 입력해주세요."
                });
            }

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