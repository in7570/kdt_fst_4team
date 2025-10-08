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
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
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
    const userProfileImg = document.getElementById('user-profile-img');
    const dropdown = document.querySelector('.user-profile .dropdown');

    if (userProfileImg) {
        userProfileImg.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    });

    // 할 일 목록 렌더링 함수
    const renderTodos = (todos) => {
        if (!todoList) return;
        todoList.innerHTML = ''; // 목록 초기화
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.dataset.id = todo.id;
            if (todo.is_completed) {
                li.classList.add('checked');
            }

            // innerHTML을 사용하여 복잡한 구조를 한 번에 생성
            li.innerHTML = `
                <div class="checkbox-container">
                    <div class="checkbox"></div>
                    <span>${todo.content}</span>
                </div>
                <button class="delete-btn">×</button>
            `;

            // 체크박스 클릭 시 완료/미완료 처리
            const checkboxContainer = li.querySelector('.checkbox-container');
            checkboxContainer.addEventListener('click', async (e) => {
                // 이벤트 전파를 막아 span의 이벤트 리스너가 반응하지 않도록 함
                e.stopPropagation(); 
                
                const isCompleted = !li.classList.contains('checked');
                try {
                    const response = await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ is_completed: isCompleted })
                    });
                    if (!response.ok) throw new Error('Todo update failed');
                    // 성공 시 UI 즉시 업데이트 후, 서버와 동기화
                    li.classList.toggle('checked');
                } catch (error) {
                    console.error('Error updating todo:', error);
                    // 실패 시 원래 상태로 되돌리거나 사용자에게 알림
                    alert('항목 업데이트에 실패했습니다.');
                }
            });

            // 삭제 버튼 이벤트 리스너 추가
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async () => {
                if (confirm('정말 삭제하시겠습니까?')) {
                    await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    li.remove(); // UI에서 즉시 삭제
                }
            });

            // 할 일 내용(span) 더블클릭 시 수정 기능
            const span = li.querySelector('span');

            // span을 클릭했을 때 이벤트가 부모로 전파되는 것을 막아 완료 처리를 방지
            span.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            span.addEventListener('dblclick', () => {
                const currentContent = span.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentContent;
                
                // 수정 input 클릭 시 이벤트 버블링을 막아 완료 처리를 방지
                input.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                // span을 input으로 교체
                span.style.display = 'none';
                checkboxContainer.appendChild(input);
                input.focus();

                const saveChanges = async () => {
                    const newContent = input.value.trim();
                    
                    // 내용이 비어있거나 변경되지 않았으면 원래대로 복구
                    if (!newContent || newContent === currentContent) {
                        input.remove();
                        span.style.display = '';
                        return;
                    }

                    // 서버에 변경사항 전송
                    try {
                        const response = await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                            method: 'PUT',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ content: newContent })
                        });
                        if (!response.ok) throw new Error('Update failed');
                        
                        // 성공 시 UI 업데이트
                        span.textContent = newContent;
                    } catch (error) {
                        console.error('Error updating content:', error);
                        alert('내용 수정에 실패했습니다.');
                    } finally {
                        // input을 다시 span으로 복구
                        input.remove();
                        span.style.display = '';
                    }
                };

                // input 포커스가 해제되거나 Enter 키를 누르면 저장
                input.addEventListener('blur', saveChanges);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        input.blur(); // blur 이벤트를 트리거하여 저장 로직 실행
                    } else if (e.key === 'Escape') {
                        // Esc 키를 누르면 수정 취소
                        input.remove();
                        span.style.display = '';
                    }
                });
            });

            todoList.appendChild(li);
        });
    };

    // 태그 목록 렌더링 함수
    const renderTags = (tags) => {
        if (!tagList) return;
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
        if (!tagList) return;
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
        const filterAll = document.getElementById('filter-all');
        if (filterAll) {
            filterAll.addEventListener('click', (e) => {
                e.preventDefault();
                fetchTodos({});
                updateActiveFilter(e.target);
            });
        }
        const filterToday = document.getElementById('filter-today');
        if (filterToday) {
            filterToday.addEventListener('click', (e) => {
                e.preventDefault();
                fetchTodos({ filter: 'today' });
                updateActiveFilter(e.target);
            });
        }
        const filterImportant = document.getElementById('filter-important');
        if (filterImportant) {
            filterImportant.addEventListener('click', (e) => {
                e.preventDefault();
                fetchTodos({ is_important: 'true' });
                updateActiveFilter(e.target);
            });
        }

        // 페이지 로드 시 할 일 및 태그 목록 불러오기
        fetchTodos({});
        fetchTags();
        if (filterAll) {
            updateActiveFilter(filterAll);
        }

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
