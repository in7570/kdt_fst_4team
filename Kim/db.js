const mysql = require('mysql2/promise');

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // DB 호스트
    user: process.env.DB_USER || 'root', // DB 사용자 이름
    password: process.env.DB_PASSWORD || 'root', // DB 비밀번호
    database: process.env.DB_NAME || 'todolist_db', // 사용할 데이터베이스 이름
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
