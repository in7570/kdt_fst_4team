const mysql = require('mysql2/promise');
const pool = require('./db');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root'
};

const dbName = 'todolist_db';

const initializeDatabase = async () => {
    let connection;
    try {
        // 데이터베이스가 없는 경우를 대비해, 데이터베이스 이름 없이 연결
        connection = await mysql.createConnection(dbConfig);
        
        // 데이터베이스 생성 (이미 존재하면 아무 작업도 하지 않음)
        const [dbResult] = await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        if (dbResult.warningStatus === 0) {
            console.log(`데이터베이스 '${dbName}'이(가) 생성되었습니다.`);
        }
        
        // 초기 연결 종료
        await connection.end();

        // db.js에서 가져온 공유 풀을 사용하여 테이블 생성
        const dbConnection = await pool.getConnection();
        
        let tablesWereCreated = false;
        const logCreation = (tableName) => {
            if (!tablesWereCreated) {
                console.log('테이블 생성을 시작합니다...');
                tablesWereCreated = true;
            }
            console.log(`${tableName} 테이블 생성 완료.`);
        };

        const [usersResult] = await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                nickname VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        if (usersResult.warningStatus === 0) logCreation('Users');

        const [todosResult] = await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS Todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                content TEXT NOT NULL,
                is_completed BOOLEAN DEFAULT FALSE,
                due_date DATE,
                is_important BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            );
        `);
        if (todosResult.warningStatus === 0) logCreation('Todos');

        const [tagsResult] = await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS Tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(255) NOT NULL,
                UNIQUE (user_id, name),
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            );
        `);
        if (tagsResult.warningStatus === 0) logCreation('Tags');

        const [todoTagsResult] = await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS Todo_Tags (
                todo_id INT,
                tag_id INT,
                PRIMARY KEY (todo_id, tag_id),
                FOREIGN KEY (todo_id) REFERENCES Todos(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
            );
        `);
        if (todoTagsResult.warningStatus === 0) logCreation('Todo_Tags');

        if (tablesWereCreated) {
            console.log('모든 테이블이 성공적으로 생성되었습니다.');
        }
        
        // 사용한 연결만 풀에 반환
        dbConnection.release();
        // 공유 풀이므로 여기서 pool.end()를 호출하지 않습니다.
        // 풀은 애플리케이션이 종료될 때 app.js에서 닫아줍니다.

    } catch (error) {
        console.error('데이터베이스 설정 중 오류가 발생했습니다:', error);
        if (connection) await connection.end();
        // 오류 발생 시 프로세스를 종료하여 서버가 비정상 상태로 실행되는 것을 방지
        process.exit(1);
    }
};

module.exports = initializeDatabase;
