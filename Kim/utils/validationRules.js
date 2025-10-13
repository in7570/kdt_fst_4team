const { body } = require('express-validator');
const { ERROR_MESSAGES } = require('./responseMessages');

const USERNAME_VALIDATION = body('username')
    .isLength({ min: 8, max: 255 }).withMessage('아이디는 8자 이상, 255자 이하이어야 합니다.')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('아이디는 영어와 숫자만 사용 가능합니다.');

const PASSWORD_VALIDATION = body('password')
    .isLength({ min: 8, max: 255 }).withMessage('비밀번호는 8자 이상, 255자 이하이어야 합니다.')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('비밀번호는 영어와 숫자만 사용 가능합니다.');

const NEW_PASSWORD_VALIDATION = body('newPassword')
    .isLength({ min: 8, max: 255 }).withMessage('새 비밀번호는 8자 이상, 255자 이하이어야 합니다.')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('새 비밀번호는 영어와 숫자만 사용 가능합니다.');

const NICKNAME_VALIDATION = body('nickname')
    .isLength({ min: 8, max: 255 }).withMessage('닉네임은 8자 이상, 255자 이하이어야 합니다.')
    .matches(/^[a-zA-Z0-9가-힣]+$/).withMessage('닉네임은 한글, 영어, 숫자만 사용 가능합니다.');

const TODO_VALIDATION = {
    CONTENT: body('content').optional({ checkFalsy: true }).trim(),
    IS_COMPLETED: body('is_completed').optional().isBoolean().withMessage('is_completed 값은 true 또는 false여야 합니다.'),
    DUE_DATE: body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date가 유효한 날짜 형식이 아닙니다.'),
    IS_IMPORTANT: body('is_important').optional().isBoolean().withMessage('is_important 값은 true 또는 false여야 합니다.'),
};

const TAG_VALIDATION = {
    NAME: body('name').optional().not().isEmpty().withMessage('태그 이름은 비워둘 수 없습니다.').trim(),
    COLOR: body('color').optional().isHexColor().withMessage('유효한 색상 코드를 입력해주세요.'),
};


module.exports = {
    USERNAME_VALIDATION,
    PASSWORD_VALIDATION,
    NEW_PASSWORD_VALIDATION,
    NICKNAME_VALIDATION,
    TODO_VALIDATION,
    TAG_VALIDATION,
};
