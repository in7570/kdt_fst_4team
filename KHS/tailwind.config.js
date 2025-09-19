/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
                'primary': '#1871C2',       // 주요 색상
                'background': '#F8F9FA',    // 배경
                'sidebar': '#E9ECEF',       // 사이드바
                'edge': '#DEE2E6',          // 테두리
                'delete': '#E03131',        // 삭제/주의
                'text_basic': '#212529',    // 기본 텍스트
                'text_sub': '#868E96',      // 보조 텍스트
                'plus_btn': '#F1F3F5',      // 추가 버튼
                'plus': '#495057',          // 추가 버튼 아이콘
                'important': '#FFD8A8',     // 주제/중요
                'work': '#D0EBFF',          // 주제/업무
                'promise': '#FFF3BF',       // 주제/약속
                'study': '#D3F9D8',         // 주제/공부
                'exercise': '#C5F6FA',      // 주제/운동
                'hobby': '#E5DBFF',         // 주제/취미
            },
            fontFamily: {
                sans: ['Pretendard', 'sans-serif'],
            },
            boxShadow: {
                'custom': '0 4px 4px 0 rgba(0, 0, 0, 0.05)',
            }
    },
  },
  plugins: [],
}

