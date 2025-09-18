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

const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const userNameInput = document.getElementById('username');
        const idInput = document.getElementById('id');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const nickNameInput = document.getElementById('nickname');

        if (userNameInput.value.trim() === '') {
            alert('이름을 입력해주세요.');
            userNameInput.focus();
            return;
        }
        if (userNameInput.value.length > 10) {
            alert(`이름이 너무 깁니다. (최대 ${10}자)`);
            userNameInput.focus();
            return;
        }
        if (idInput.value.trim() === '') {
            alert('아이디를 입력해주세요.');
            idInput.focus();
            return;
        }
        if (idInput.value.length < 3 || idInput.value.length > 10) {
            alert(`아이디는 ${3}자 이상 ${10}자 이하로 입력해주세요.`);
            idInput.focus();
            return;
        }
        if (passwordInput.value.trim() === '') {
            alert('비밀번호를 입력해주세요.');
            passwordInput.focus();
            return;
        }
        if (passwordInput.value.length < 3 || passwordInput.value.length > 10) {
            alert(`비밀번호는 ${3}자 이상 ${10}자 이하로 입력해주세요.`);
            passwordInput.focus();
            return;
        }
        if (confirmPasswordInput.value.trim() === '') {
            alert('비밀번호 확인을 입력해주세요.');
            confirmPasswordInput.focus();
            return;
        }
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('비밀번호가 일치하지 않습니다. 다시 입력해 주세요.');
            confirmPasswordInput.focus();
            return;
        }
        if (nickNameInput.value.trim() === '') {
            alert('닉네임을 입력해주세요.');
            nickNameInput.focus();
            return;
        }
        if (nickNameInput.value.length > 10) {
            alert(`닉네임이 너무 깁니다. (최대 ${10}자)`);
            nickNameInput.focus();
            return;
        }
        alert('회원가입 성공!');
        // 로그인 페이지로 돌아감
    });
}


