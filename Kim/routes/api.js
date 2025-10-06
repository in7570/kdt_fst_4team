const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const jwtSecret = 'your_jwt_secret'; // 실제 프로덕션에서는 환경 변수로 관리해야 합니다.

// --- 사용자 (Users) API ---

// 회원가입
router.post('/users/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    if (!username || !password || !nickname) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await pool.query(
            'INSERT INTO Users (username, password, nickname) VALUES (?, ?, ?)',
            [username, hashedPassword, nickname]
        );
        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
        }
        console.error('회원가입 중 오류:', error);
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

// 로그인
router.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
    }
    try {
        const [users] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign({ id: user.id, username: user.username, nickname: user.nickname }, jwtSecret, { expiresIn: '1h' });
            res.json({ message: '로그인 성공', token });
        } else {
            res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }
    } catch (error) {
        console.error('로그인 중 오류:', error);
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

// 로그아웃 (플레이스홀더)
router.post('/users/logout', (req, res) => {
    res.json({ message: '로그아웃 성공' });
});


// --- 인증 미들웨어 ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // 토큰이 없음

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403); // 토큰이 유효하지 않음
        req.user = user;
        next();
    });
};


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
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

// 새로운 할 일 생성
router.post('/todos', authenticateToken, async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: '내용을 입력하세요.' });
    }
    try {
        const [result] = await pool.query('INSERT INTO Todos (content, user_id) VALUES (?, ?)', [content, req.user.id]);
        res.status(201).json({ message: '할 일 추가 성공', todoId: result.insertId });
    } catch (error) {
        console.error('할 일 생성 중 오류:', error);
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

// 특정 할 일 상세 조회
router.get('/todos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [todos] = await pool.query('SELECT * FROM Todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (todos.length === 0) {
            return res.status(404).json({ message: '할 일을 찾을 수 없거나 권한이 없습니다.' });
        }
        res.json(todos[0]);
    } catch (error) {
        console.error(`할 일 #${id} 조회 중 오류:`, error);
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});


// 할 일 정보 업데이트 (전체 필드)
router.put('/todos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content, is_completed, due_date, is_important } = req.body;

    try {
        const [todos] = await pool.query('SELECT * FROM Todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (todos.length === 0) {
            return res.status(404).json({ message: '해당 할 일을 찾을 수 없거나 권한이 없습니다.' });
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

        res.json({ message: `할 일 #${id} 업데이트 성공` });
    } catch (error) {
        console.error(`할 일 #${id} 업데이트 중 오류:`, error);
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

// 할 일 삭제
router.delete('/todos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // 해당 할 일이 현재 사용자의 것인지 확인하는 로직 추가 (보안 강화)
        const [todos] = await pool.query('SELECT * FROM Todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (todos.length === 0) {
            return res.status(404).json({ message: '해당 할 일을 찾을 수 없거나 권한이 없습니다.' });
        }

        await pool.query('DELETE FROM Todos WHERE id = ?', [id]);
        res.json({ message: `할 일 #${id} 삭제 성공` });
    } catch (error) {
        console.error(`할 일 #${id} 삭제 중 오류:`, error);
        res.status(500).json({ message: '데이터베이스 오류' });
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
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

// 새로운 태그 생성
router.post('/tags', authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: '태그 이름을 입력하세요.' });
    }
    try {
        const [result] = await pool.query('INSERT INTO Tags (name, user_id) VALUES (?, ?)', [name, req.user.id]);
        res.status(201).json({ message: '태그 생성 성공', tagId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '이미 존재하는 태그입니다.' });
        }
        console.error('태그 생성 중 오류:', error);
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

// 태그 삭제
router.delete('/tags/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // 해당 태그가 현재 사용자의 것인지 확인
        const [tags] = await pool.query('SELECT * FROM Tags WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (tags.length === 0) {
            return res.status(404).json({ message: '해당 태그를 찾을 수 없거나 권한이 없습니다.' });
        }

        await pool.query('DELETE FROM Tags WHERE id = ?', [id]);
        res.json({ message: `태그 #${id} 삭제 성공` });
    } catch (error) {
        console.error(`태그 #${id} 삭제 중 오류:`, error);
        res.status(500).json({ message: '데이터베이스 오류' });
    }
});

module.exports = router;
