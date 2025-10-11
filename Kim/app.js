require('dotenv').config();
const express = require('express');
const path = require('path');
const apiRouter = require('./routes/api');
const initializeDatabase = require('./init-db');
const pool = require('./db'); // graceful shutdown을 위해 pool 가져오기

const app = express();
const port = process.env.PORT || 3000;

// JSON 및 URL-encoded 바디 파서 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));


// API 라우터 연결
app.use('/api', apiRouter);

// 루트 경로 접속 시 로그인 페이지로 이동
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// 서버 시작 함수
const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(port, () => {
            console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
        });
    } catch (error) {
        console.error('서버 시작에 실패했습니다:', error);
        process.exit(1); // 시작 실패 시 프로세스 종료
    }
};

// 서버 시작
startServer();

// 정상 종료 처리
const gracefulShutdown = async () => {
    console.log('\n서버를 종료합니다...');
    try {
        await pool.end();
        console.log('데이터베이스 연결 풀이 정상적으로 닫혔습니다.');
        process.exit(0);
    } catch (error) {
        console.error('데이터베이스 연결 풀을 닫는 중 오류 발생:', error);
        process.exit(1);
    }
};

// Ctrl+C 또는 kill 명령어에 반응
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
