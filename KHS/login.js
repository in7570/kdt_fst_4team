document.querySelectorAll('.watch-pwd-open').forEach(openIcon => {
    openIcon.addEventListener('click', (event) => {
        const container = event.target.parentElement;
        const input = container.querySelector('input');
        const closeIcon = container.querySelector('.watch-pwd-close');

        if(input && closeIcon) {
            input.type = 'text';
            event.target.classList.add('hidden');
            closeIcon.classList.remove('hidden');
        }
    });
});

document.querySelectorAll('.watch-pwd-close').forEach(closeIcon => {
    closeIcon.addEventListener('click', (event) => {
        const container = event.target.parentElement;
        const input = container.querySelector('input');
        const openIcon = container.querySelector('.watch-pwd-open');

        if(input && openIcon) {
            input.type = 'password';
            event.target.classList.add('hidden');
            openIcon.classList.remove('hidden');
        }
    });
});

// 로그인 API 사용
// 로그인 성공 시 메인 페이지로 돌아감