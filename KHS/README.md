# TODO-LIST
---
## 📜 프로젝트 설명
이 프로젝트는 Node.js, Express, MariaDB를 사용하여 사용자가 계정을 만들고 로그인하여 자신만의 할 일 목록을 관리할 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능
- 사용자 회원가입 및 로그인
- 비밀번호 변경
- 할 일 목록(Todo List) 관리 (기능 확장 예정)

## 🛠️ 사용 기술
- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MariaDB
- **기타:** `express-validator` (입력 유효성 검사)

## 📂 프로젝트 구조
```
KHS/
├── database/
│   └── mariadb.js        # 데이터베이스 연결 설정
├── node_modules/
├── routes/
│   └── user.js           # 사용자 관련 API 라우트
├── .gitignore
├── index.html            # 메인 페이지
├── login.html            # 로그인 페이지
├── password.html         # 비밀번호 변경 페이지
├── register.html         # 회원가입 페이지
├── server.js             # Express 서버 실행 파일
├── package.json
└── tailwind.config.js
```

## 🚀 설치 및 실행 방법

1.  **저장소 복제**
    ```bash
    git clone <repository-url>
    cd KHS
    ```

2.  **NPM 패키지 설치**
    ```bash
    npm install
    ```

3.  **데이터베이스 설정**
    - MariaDB(또는 MySQL)를 설치하고 실행합니다.
    - `TodoList` 데이터베이스를 생성합니다.
    - 아래 SQL을 실행하여 `users` 테이블을 생성합니다.
      ```sql
      CREATE TABLE users (
          id VARCHAR(10) PRIMARY KEY,
          name VARCHAR(6) NOT NULL,
          password VARCHAR(10) NOT NULL,
          nickname VARCHAR(6) NOT NULL
      );
      ```
    - `database/mariadb.js` 파일의 데이터베이스 연결 정보를 자신의 환경에 맞게 수정하세요. (보안을 위해 환경 변수 사용을 권장합니다.)

4.  **Tailwind CSS 빌드**
    ```bash
    npm run build:css
    ```

5.  **서버 실행**
    ```bash
    node server.js
    ```

6.  웹 브라우저에서 `http://localhost:<port>` (포트 번호는 `server.js`에 지정된 값)로 접속합니다.

## 📝 API 엔드포인트

### User
- `GET /`: 메인 페이지를 렌더링합니다.
- `GET /login`: 로그인 페이지를 렌더링합니다.
- `POST /login`: 사용자 로그인을 처리합니다.
- `GET /register`: 회원가입 페이지를 렌더링합니다.
- `POST /register`: 신규 사용자 정보를 등록합니다.
- `GET /password`: 비밀번호 변경 페이지를 렌더링합니다.
- `POST /password`: 기존 사용자의 비밀번호를 변경합니다.
