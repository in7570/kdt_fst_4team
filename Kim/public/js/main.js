document.addEventListener('DOMContentLoaded', () => {

    // --- 공통 변수 및 함수 ---
    const apiBaseUrl = '/api';
    const token = localStorage.getItem('token');

    // 인증 토큰을 포함한 요청 헤더를 생성하는 함수
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // JWT 페이로드를 디코딩하는 함수 (닉네임 표시용)
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };


    // --- 회원 관리 ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;

            try {
                const response = await fetch(`${apiBaseUrl}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token); // JWT 저장
                    window.location.href = '/index.html';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('로그인 중 오류:', error);
                alert('로그인 중 오류가 발생했습니다.');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const nickname = e.target.nickname.value;
            const passwordConfirm = e.target['password-confirm'].value;

            if (password !== passwordConfirm) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            try {
                const response = await fetch(`${apiBaseUrl}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, nickname })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('회원가입 성공! 로그인 페이지로 이동합니다.');
                    window.location.href = '/login.html';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('회원가입 중 오류:', error);
                alert('회원가입 중 오류가 발생했습니다.');
            }
        });
    }

    // --- 메인 페이지 (투두리스트) ---
    const todoForm = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');
    const tagForm = document.getElementById('tag-form');
    const tagList = document.getElementById('tag-list');
    const logoutBtn = document.getElementById('logout-btn');
    const userNicknameSpan = document.getElementById('user-nickname');

    // 할 일 목록 렌더링 함수
    const renderTodos = (todos) => {
        todoList.innerHTML = ''; // 목록 초기화
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.dataset.id = todo.id;
            if (todo.is_completed) {
                li.classList.add('completed');
            }
            if (todo.is_important) {
                li.classList.add('important'); // 중요 항목 클래스 추가
            }

            // 완료 체크박스
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.is_completed;
            checkbox.addEventListener('change', async () => {
                await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ is_completed: checkbox.checked })
                });
                fetchTodos(currentFilter);
            });

            // 할 일 내용 (클릭 시 수정 가능)
            const span = document.createElement('span');
            span.textContent = todo.content;
            span.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = span.textContent;
                li.replaceChild(input, span);
                input.focus();

                const saveChanges = async () => {
                    const newContent = input.value.trim();
                    if (newContent && newContent !== todo.content) {
                        await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                            method: 'PUT',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ content: newContent })
                        });
                    }
                    fetchTodos(currentFilter);
                };

                input.addEventListener('blur', saveChanges);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        saveChanges();
                    }
                });
            });

            // 중요 버튼
            const importantBtn = document.createElement('button');
            importantBtn.textContent = todo.is_important ? '★' : '☆';
            importantBtn.classList.add('important-btn');
            importantBtn.addEventListener('click', async () => {
                await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ is_important: !todo.is_important })
                });
                fetchTodos(currentFilter);
            });

            // 삭제 버튼
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '삭제';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', async () => {
                if (confirm('정말 삭제하시겠습니까?')) {
                    await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    fetchTodos(currentFilter);
                }
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(importantBtn);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    };

    // 태그 목록 렌더링 함수
    const renderTags = (tags) => {
        tagList.innerHTML = ''; // 목록 초기화
        tags.forEach(tag => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = tag.name;
            a.dataset.tagId = tag.id;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentFilter = { tag_id: tag.id };
                fetchTodos(currentFilter);
                updateActiveFilter(a);
            });

            const deleteTagBtn = document.createElement('button');
            deleteTagBtn.textContent = 'X';
            deleteTagBtn.classList.add('delete-tag-btn'); // 스타일링을 위한 클래스
            deleteTagBtn.addEventListener('click', async () => {
                if (confirm(`태그 '${tag.name}'을(를) 삭제하시겠습니까?`)) {
                    await fetch(`${apiBaseUrl}/tags/${tag.id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    fetchTags(); // 태그 목록 새로고침
                    currentFilter = {}; // 필터 초기화
                    fetchTodos(); // 전체 할 일 목록 새로고침
                }
            });

            li.appendChild(a);
            li.appendChild(deleteTagBtn);
            tagList.appendChild(li);
        });
    };

    let currentFilter = {}; // 현재 필터 상태 저장

    // 할 일 목록 불러오기 (필터 객체 사용)
    const fetchTodos = async (filter = {}) => {
        currentFilter = filter;
        let url = new URL(`${window.location.origin}${apiBaseUrl}/todos`);
        Object.keys(filter).forEach(key => url.searchParams.append(key, filter[key]));

        try {
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            
            if (response.status === 401 || response.status === 403) {
                alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            const todos = await response.json();
            renderTodos(todos);
        } catch (error) {
            console.error('할 일 목록을 불러오는 데 실패했습니다:', error);
            if (todoList) todoList.innerHTML = '<li>목록을 불러오는 데 실패했습니다.</li>';
        }
    };

    // 태그 목록 불러오기
    const fetchTags = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/tags`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            const tags = await response.json();
            renderTags(tags);
        } catch (error) {
            console.error('태그 목록을 불러오는 데 실패했습니다:', error);
        }
    };

    // 활성 필터 UI 업데이트
    const updateActiveFilter = (clickedElement) => {
        document.querySelectorAll('.sidebar a.active').forEach(el => el.classList.remove('active'));
        if (clickedElement) {
            clickedElement.classList.add('active');
        }
    };

    // 메인 페이지 전용 로직
    if (document.body.contains(todoForm)) {
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const user = parseJwt(token);
        if (user && userNicknameSpan) {
            userNicknameSpan.textContent = user.nickname || user.username;
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            });
        }

        // 태그 생성 폼 처리
        if (tagForm) {
            tagForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const tagInput = document.getElementById('tag-input');
                const name = tagInput.value.trim();

                if (!name) return;

                await fetch(`${apiBaseUrl}/tags`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ name })
                });

                tagInput.value = '';
                fetchTags(); // 태그 목록 새로고침
            });
        }

        // 사이드바 필터 이벤트 리스너
        document.getElementById('filter-all').addEventListener('click', (e) => {
            e.preventDefault();
            fetchTodos({});
            updateActiveFilter(e.target);
        });
        document.getElementById('filter-today').addEventListener('click', (e) => {
            e.preventDefault();
            fetchTodos({ filter: 'today' });
            updateActiveFilter(e.target);
        });
        document.getElementById('filter-important').addEventListener('click', (e) => {
            e.preventDefault();
            fetchTodos({ is_important: 'true' });
            updateActiveFilter(e.target);
        });

        // 페이지 로드 시 할 일 및 태그 목록 불러오기
        fetchTodos({});
        fetchTags();
        updateActiveFilter(document.getElementById('filter-all'));

        // 새로운 할 일 추가
        todoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const todoInput = document.getElementById('todo-input');
            const content = todoInput.value.trim();

            if (!content) return;

            await fetch(`${apiBaseUrl}/todos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ content })
            });

            todoInput.value = '';
            fetchTodos(currentFilter);
        });
    }
});
