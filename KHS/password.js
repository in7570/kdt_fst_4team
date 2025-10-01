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
        const newPasswordInput = document.getElementById('new-password');
        const confirmNewPasswordInput = document.getElementById('confirm-new-password');

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

        if (newPasswordInput.value.trim() === '') {
            alert('새 비밀번호를 입력해주세요.');
            newPasswordInput.focus();
            return;
        }
        if (newPasswordInput.value.length < 3 || newPasswordInput.value.length > 10) {
            alert(`새 비밀번호는 ${3}자 이상 ${10}자 이하로 입력해주세요.`);
            newPasswordInput.focus();
            return;
        }

        if (confirmNewPasswordInput.value.trim() === '') {
            alert('새 비밀번호 확인을 입력해주세요.');
            passwordInput.focus();
            return;
        }
        if (newPasswordInput.value !== confirmNewPasswordInput.value) {
            alert('새 비밀번호가 일치하지 않습니다. 다시 입력해 주세요.');
            confirmPasswordInput.focus();
            return;
        }

        const newPwdData = {
            id: idInput.value,
            pwd: newPasswordInput.value,
            confirm_pwd: confirmNewPasswordInput.value
        };

        fetch('/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPwdData)
        })
        .then(response => response.json())
        .then(data => {
            if(data.message === "비밀번호 변경 성공!") {
                alert('비밀번호 변경 성공!');
                window.location.href = '/login';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.log('Error:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        });
    });
}