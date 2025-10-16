const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.error('JWT_SECRET이 .env 파일에 설정되지 않았습니다. 프로그램을 종료합니다.');
    process.exit(1);
}

// JWT 토큰을 검증하여 사용자를 인증하는 미들웨어
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
        }
        req.user = user;
        next();
    });
};

// express-validator의 유효성 검사 에러를 처리하는 미들웨어
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: '입력값이 올바르지 않습니다.',
            errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    handleValidationErrors,
};
