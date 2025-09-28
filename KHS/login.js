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

        const idInput = document.getElementById('id');
        const passwordInput = document.getElementById('password');

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

        const loginData = {
            id: idInput.value,
            pwd: passwordInput.value,
        };

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())
        .then(data => {
            if(data.message === "로그인 성공!") {
                alert('로그인 성공!');
                window.location.href = '/';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.log('Error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        });
    });
}

// 로그인 API 사용
// 로그인 성공 시 메인 페이지로 돌아감