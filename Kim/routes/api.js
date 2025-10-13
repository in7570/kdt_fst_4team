const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { STATUS_CODE, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/responseMessages');
const {
    USERNAME_VALIDATION,
    PASSWORD_VALIDATION,
    NEW_PASSWORD_VALIDATION,
    NICKNAME_VALIDATION,
    TODO_VALIDATION,
    TAG_VALIDATION,
} = require('../utils/validationRules');


const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

// 유효성 검사 에러를 처리하는 미들웨어
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            message: ERROR_MESSAGES.INVALID_INPUT,
            errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
        });
    }
    next();
};


// --- 사용자 (Users) API ---

// 회원가입
router.post('/users/register', [
    USERNAME_VALIDATION,
    PASSWORD_VALIDATION,
    NICKNAME_VALIDATION,
    handleValidationErrors
], async (req, res) => {
    const { username, password, nickname } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await pool.query(
            'INSERT INTO Users (username, password, nickname) VALUES (?, ?, ?)',
            [username, hashedPassword, nickname]
        );
        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(STATUS_CODE.CONFLICT).json({ message: ERROR_MESSAGES.DUPLICATE_USERNAME });
        }
        console.error('회원가입 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 로그인
router.post('/users/login', [
    body('username', '아이디를 입력해주세요.').not().isEmpty(),
    body('password', '비밀번호를 입력해주세요.').not().isEmpty(),
    handleValidationErrors
], async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: ERROR_MESSAGES.INCORRECT_LOGIN_INFO });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign({ id: user.id, username: user.username, nickname: user.nickname }, jwtSecret, { expiresIn: '1h' });
            res.json({ message: SUCCESS_MESSAGES.LOGIN_SUCCESS, token });
        } else {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ message: ERROR_MESSAGES.INCORRECT_LOGIN_INFO });
        }
    } catch (error) {
        console.error('로그인 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 비밀번호 찾기 (임시 비밀번호 발급)
router.post('/users/find-password', [
    body('username', '아이디를 입력해주세요.').isEmail().withMessage('유효한 이메일 주소를 입력해주세요.'),
    body('nickname', '닉네임을 입력해주세요.').not().isEmpty(),
    handleValidationErrors
], async (req, res) => {
    const { username, nickname } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM Users WHERE username = ? AND nickname = ?', [username, nickname]);
        if (users.length === 0) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERROR_MESSAGES.NO_MATCHING_USER });
        }

        const user = users[0];
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);

        await pool.query('UPDATE Users SET password = ? WHERE id = ?', [hashedTempPassword, user.id]);

        res.json({ message: SUCCESS_MESSAGES.TEMP_PASSWORD_ISSUED, tempPassword });

    } catch (error) {
        console.error('비밀번호 찾기 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
});

// 로그아웃 (플레이스홀더)
router.post('/users/logout', (req, res) => {
    res.json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
});


// --- 인증 미들웨어 ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(STATUS_CODE.UNAUTHORIZED); // 토큰이 없음

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(STATUS_CODE.FORBIDDEN); // 토큰이 유효하지 않음
        req.user = user;
        next();
    });
};

// 비밀번호 변경
router.put('/users/change-password', authenticateToken, [
    body('currentPassword', '현재 비밀번호를 입력해주세요.').not().isEmpty(),
    NEW_PASSWORD_VALIDATION,
    handleValidationErrors
], async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const [users] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        await pool.query('UPDATE Users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

        res.json({ message: SUCCESS_MESSAGES.PASSWORD_CHANGE_SUCCESS });

    } catch (error) {
        console.error('비밀번호 변경 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
});


// --- 투두 (Todos) API (인증 필요) ---

// 현재 사용자의 모든 할 일 조회 (필터링 기능 추가)
router.get('/todos', authenticateToken, async (req, res) => {
    const { tag_id, filter, is_important } = req.query;
    const userId = req.user.id;

    try {
        let query = 'SELECT t.* FROM Todos t';
        const params = [];

        if (tag_id) {
            query += ' INNER JOIN Todo_Tags tt ON t.id = tt.todo_id';
        }

        query += ' WHERE t.user_id = ?';
        params.push(userId);

        if (tag_id) {
            query += ' AND tt.tag_id = ?';
            params.push(tag_id);
        }
        if (filter === 'today') {
            query += ' AND DATE(t.due_date) = CURDATE()';
        }
        if (is_important === 'true') {
            query += ' AND t.is_important = true';
        }

        query += ' ORDER BY t.created_at DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('할 일 조회 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 새로운 할 일 생성
router.post('/todos', authenticateToken, [
    body('content', '내용을 입력하세요.').not().isEmpty().trim(),
    handleValidationErrors
], async (req, res) => {
    const { content } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO Todos (content, user_id) VALUES (?, ?)', [content, req.user.id]);
        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MESSAGES.TODO_ADD_SUCCESS, todoId: result.insertId });
    } catch (error) {
        console.error('할 일 생성 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 특정 할 일 상세 조회
router.get('/todos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [todos] = await pool.query('SELECT * FROM Todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (todos.length === 0) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERROR_MESSAGES.TODO_NOT_FOUND });
        }
        res.json(todos[0]);
    } catch (error) {
        console.error(`할 일 #${id} 조회 중 오류:`, error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});


// 할 일 정보 업데이트 (전체 필드)
router.put('/todos/:id', authenticateToken, [
    TODO_VALIDATION.CONTENT,
    TODO_VALIDATION.IS_COMPLETED,
    TODO_VALIDATION.DUE_DATE,
    TODO_VALIDATION.IS_IMPORTANT,
    handleValidationErrors
], async (req, res) => {
    const { id } = req.params;
    const { content, is_completed, due_date, is_important } = req.body;

    try {
        const [todos] = await pool.query('SELECT * FROM Todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (todos.length === 0) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERROR_MESSAGES.TODO_NOT_FOUND });
        }

        const todoToUpdate = todos[0];
        const updatedTodo = {
            content: content !== undefined ? content : todoToUpdate.content,
            is_completed: is_completed !== undefined ? is_completed : todoToUpdate.is_completed,
            due_date: due_date !== undefined ? due_date : todoToUpdate.due_date,
            is_important: is_important !== undefined ? is_important : todoToUpdate.is_important
        };

        await pool.query(
            'UPDATE Todos SET content = ?, is_completed = ?, due_date = ?, is_important = ? WHERE id = ?',
            [updatedTodo.content, updatedTodo.is_completed, updatedTodo.due_date, updatedTodo.is_important, id]
        );

        res.json({ message: SUCCESS_MESSAGES.TODO_UPDATE_SUCCESS(id) });
    } catch (error) {
        console.error(`할 일 #${id} 업데이트 중 오류:`, error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 할 일 삭제
router.delete('/todos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const [todos] = await pool.query('SELECT * FROM Todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (todos.length === 0) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERROR_MESSAGES.TODO_NOT_FOUND });
        }

        await pool.query('DELETE FROM Todos WHERE id = ?', [id]);
        res.json({ message: SUCCESS_MESSAGES.TODO_DELETE_SUCCESS(id) });
    } catch (error) {
        console.error(`할 일 #${id} 삭제 중 오류:`, error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// --- 태그 (Tags) API (인증 필요) ---

// 현재 사용자의 모든 태그 조회
router.get('/tags', authenticateToken, async (req, res) => {
    try {
        const [tags] = await pool.query('SELECT * FROM Tags WHERE user_id = ? ORDER BY name ASC', [req.user.id]);
        res.json(tags);
    } catch (error) {
        console.error('태그 조회 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 새로운 태그 생성
router.post('/tags', authenticateToken, [
    body('name', '태그 이름을 입력하세요.').not().isEmpty().trim(),
    TAG_VALIDATION.COLOR,
    handleValidationErrors
], async (req, res) => {
    const { name, color } = req.body;
    const userId = req.user.id;
    try {
        if (color) {
            const [existing] = await pool.query('SELECT id FROM Tags WHERE color = ? AND user_id = ?', [color, userId]);
            if (existing.length > 0) {
                return res.status(STATUS_CODE.CONFLICT).json({ message: ERROR_MESSAGES.DUPLICATE_TAG_COLOR });
            }
        }

        const [result] = await pool.query(
            'INSERT INTO Tags (name, user_id, color) VALUES (?, ?, COALESCE(?, DEFAULT(color)))',
            [name, userId, color]
        );
        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MESSAGES.TAG_CREATE_SUCCESS, tagId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(STATUS_CODE.CONFLICT).json({ message: ERROR_MESSAGES.DUPLICATE_TAG_NAME });
        }
        console.error('태그 생성 중 오류:', error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 태그 수정
router.put('/tags/:id', authenticateToken, [
    TAG_VALIDATION.NAME,
    TAG_VALIDATION.COLOR,
    handleValidationErrors
], async (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.id;

    if (!name && !color) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERROR_MESSAGES.NO_CONTENT_TO_UPDATE });
    }

    try {
        const [tags] = await pool.query('SELECT * FROM Tags WHERE id = ? AND user_id = ?', [id, userId]);
        if (tags.length === 0) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERROR_MESSAGES.TAG_NOT_FOUND });
        }

        if (color) {
            const [existing] = await pool.query('SELECT id FROM Tags WHERE color = ? AND user_id = ? AND id != ?', [color, userId, id]);
            if (existing.length > 0) {
                return res.status(STATUS_CODE.CONFLICT).json({ message: ERROR_MESSAGES.DUPLICATE_TAG_COLOR });
            }
        }

        const setClauses = [];
        const queryParams = [];
        if (name) {
            setClauses.push('name = ?');
            queryParams.push(name);
        }
        if (color) {
            setClauses.push('color = ?');
            queryParams.push(color);
        }

        const sql = `UPDATE Tags SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`;
        queryParams.push(id, userId);

        await pool.query(sql, queryParams);

        res.json({ message: SUCCESS_MESSAGES.TAG_UPDATE_SUCCESS(id) });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(STATUS_CODE.CONFLICT).json({ message: ERROR_MESSAGES.DUPLICATE_TAG_NAME_ON_UPDATE });
        }
        console.error(`태그 #${id} 업데이트 중 오류:`, error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

// 태그 삭제
router.delete('/tags/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [tags] = await pool.query('SELECT * FROM Tags WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (tags.length === 0) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERROR_MESSAGES.TAG_NOT_FOUND });
        }

        await pool.query('DELETE FROM Tags WHERE id = ?', [id]);
        res.json({ message: SUCCESS_MESSAGES.TAG_DELETE_SUCCESS(id) });
    } catch (error) {
        console.error(`태그 #${id} 삭제 중 오류:`, error);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.DATABASE_ERROR });
    }
});

module.exports = router;
