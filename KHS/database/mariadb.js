// mariadb를 연결할 세팅값 설정
const mariadb = require('mysql');

const conn = mariadb.createConnection(
    {
        host: 'localhost',
        port: 7777,
        user: 'root',
        password: 'root',
        database: 'TodoList'
    }
);

module.exports = conn;