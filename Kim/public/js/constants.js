// public/js/constants.js

const MESSAGES = {
    // 공통 오류
    ERROR_DEFAULT: '오류가 발생했습니다.',
    ERROR_UNAUTHORIZED: '인증 정보가 유효하지 않습니다. 다시 로그인해주세요.',

    // 회원 관리
    LOGIN_SUCCESS_REDIRECT: '/index.html',
    LOGIN_PAGE: '/login.html',
    REGISTER_SUCCESS: '회원가입 성공! 로그인 페이지로 이동합니다.',
    PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
    NEW_PASSWORD_MISMATCH: '새 비밀번호가 일치하지 않습니다.',
    PASSWORD_CHANGE_SUCCESS: '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.',
    TEMP_PASSWORD_ISSUED: (tempPassword) => `임시 비밀번호는 ${tempPassword} 입니다. 로그인 후 비밀번호를 변경해주세요.`,

    // 투두 (Todo)
    TODO_UPDATE_FAILED: '항목 업데이트에 실패했습니다.',
    TODO_DELETE_CONFIRM: '정말 삭제하시겠습니까?',
    TODO_CONTENT_UPDATE_FAILED: '내용 수정에 실패했습니다.',
    TODO_FETCH_FAILED: '할 일 목록을 불러오는 데 실패했습니다.',

    // 태그 (Tag)
    TAG_FETCH_FAILED: '태그 목록을 불러오는 데 실패했습니다.',
    TAG_CREATE_FAILED: (message) => `태그 생성 실패: ${message}`,
    TAG_COLOR_UPDATE_FAILED: (message) => `색상 변경 실패: ${message}`,
    TAG_DELETE_CONFIRM: (tagName) => `'${tagName}' 태그를 정말 삭제하시겠습니까?`,
    TAG_DELETE_FAILED: '태그 삭제에 실패했습니다.',
    TAG_UPDATE_FAILED: (message) => `태그 수정 실패: ${message}`,
};
