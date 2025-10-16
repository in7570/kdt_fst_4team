// HTTP 상태 코드
const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

// 성공 메시지
const SUCCESS_MESSAGES = {
    // 사용자 관련
    REGISTRATION_SUCCESS: '회원가입 성공',
    LOGIN_SUCCESS: '로그인 성공',
    LOGOUT_SUCCESS: '로그아웃 성공',
    TEMP_PASSWORD_ISSUED: '임시 비밀번호가 발급되었습니다.',
    PASSWORD_CHANGE_SUCCESS: '비밀번호가 성공적으로 변경되었습니다.',

    // 할 일(Todo) 관련
    TODO_ADD_SUCCESS: '할 일 추가 성공',
    TODO_UPDATE_SUCCESS: (id) => `할 일 #${id} 업데이트 성공`,
    TODO_DELETE_SUCCESS: (id) => `할 일 #${id} 삭제 성공`,

    // 태그(Tag) 관련
    TAG_CREATE_SUCCESS: '태그 생성 성공',
    TAG_UPDATE_SUCCESS: (id) => `태그 #${id} 업데이트 성공`,
    TAG_DELETE_SUCCESS: (id) => `태그 #${id} 삭제 성공`,
};

// 오류 메시지
const ERROR_MESSAGES = {
    // 공통
    INVALID_INPUT: '입력값이 올바르지 않습니다.',
    DATABASE_ERROR: '데이터베이스 오류',
    SERVER_ERROR: '서버 오류가 발생했습니다.',
    NOT_FOUND: '요청하신 리소스를 찾을 수 없습니다.',
    UNAUTHORIZED: '인증되지 않은 사용자입니다.',
    FORBIDDEN: '접근 권한이 없습니다.',
    NO_CONTENT_TO_UPDATE: '수정할 내용이 없습니다.',

    // 사용자 관련
    DUPLICATE_USERNAME: '이미 사용 중인 아이디입니다.',
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    INCORRECT_LOGIN_INFO: '아이디 또는 비밀번호가 잘못되었습니다.',
    NO_MATCHING_USER: '일치하는 사용자 정보가 없습니다.',
    INCORRECT_CURRENT_PASSWORD: '현재 비밀번호가 일치하지 않습니다.',

    // 할 일(Todo) 관련
    TODO_NOT_FOUND: '할 일을 찾을 수 없거나 권한이 없습니다.',

    // 태그(Tag) 관련
    TAG_NOT_FOUND: '해당 태그를 찾을 수 없거나 권한이 없습니다.',
    DUPLICATE_TAG_NAME: '이미 존재하는 태그입니다.',
    DUPLICATE_TAG_COLOR: '이미 사용 중인 색상입니다.',
    DUPLICATE_TAG_NAME_ON_UPDATE: '이미 존재하는 태그 이름입니다.',
};

module.exports = {
    STATUS_CODE,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
};
