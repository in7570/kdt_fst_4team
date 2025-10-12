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

    // --- 로그아웃 기능 (최우선 실행) ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        });
    }

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

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const nickname = e.target.nickname.value;

            try {
                const response = await fetch(`${apiBaseUrl}/users/find-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, nickname })
                });

                const result = await response.json();

                if (response.ok) {
                    alert(`임시 비밀번호는 ${result.tempPassword} 입니다. 로그인 후 비밀번호를 변경해주세요.`);
                    window.location.href = '/login.html';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('비밀번호 찾기 중 오류:', error);
                alert('비밀번호를 찾는 중 오류가 발생했습니다.');
            }
        });
    }

    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = e.target['current-password'].value;
            const newPassword = e.target['new-password'].value;
            const newPasswordConfirm = e.target['new-password-confirm'].value;

            if (newPassword !== newPasswordConfirm) {
                alert('새 비밀번호가 일치하지 않습니다.');
                return;
            }

            try {
                const response = await fetch(`${apiBaseUrl}/users/change-password`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ currentPassword, newPassword })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                } else {
                    alert(result.message);
                }            } catch (error) {
                console.error('비밀번호 변경 중 오류:', error);
                alert('비밀번호 변경 중 오류가 발생했습니다.');
            }
        });
    }

    // --- 메인 페이지 (투두리스트) ---
    const todoForm = document.getElementById('todo-form');
    if (document.body.contains(todoForm)) {
        const todoList = document.getElementById('todo-list');
        const tagForm = document.getElementById('tag-form');
        const tagList = document.getElementById('tag-list');
        const userNicknameSpan = document.getElementById('user-nickname');
        const userProfileImg = document.getElementById('user-profile-img');
        const dropdown = document.querySelector('.user-profile .dropdown');

        if (userProfileImg) {
            userProfileImg.addEventListener('click', (e) => {
                e.stopPropagation(); // 드롭다운 토글 시 이벤트 전파를 막아 window 리스너에 닿지 않게 함
                dropdown.classList.toggle('show');
            });
        }

        // 드롭다운 자체를 클릭했을 때 이벤트 전파를 막아, 내부 링크 클릭이 window 리스너를 발동시키지 않게 함
        if (dropdown) {
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // 화면의 다른 곳을 클릭하면 드롭다운을 닫음
        window.addEventListener('click', () => {
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
                    e.stopPropagation(); 
                    
                    const isCompleted = !li.classList.contains('checked');
                    try {
                        const response = await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                            method: 'PUT',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ is_completed: isCompleted })
                        });
                        if (!response.ok) throw new Error('Todo update failed');
                        li.classList.toggle('checked');
                    } catch (error) {
                        console.error('Error updating todo:', error);
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
                        li.remove();
                    }
                });

                // 할 일 내용(span) 더블클릭 시 수정 기능
                const span = li.querySelector('span');
                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                span.addEventListener('dblclick', () => {
                    const currentContent = span.textContent;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentContent;
                    
                    input.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });

                    span.style.display = 'none';
                    checkboxContainer.appendChild(input);
                    input.focus();

                    const saveChanges = async () => {
                        const newContent = input.value.trim();
                        
                        if (!newContent || newContent === currentContent) {
                            input.remove();
                            span.style.display = '';
                            return;
                        }

                        try {
                            const response = await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                                method: 'PUT',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ content: newContent })
                            });
                            if (!response.ok) throw new Error('Update failed');
                            span.textContent = newContent;
                        } catch (error) {
                            console.error('Error updating content:', error);
                            alert('내용 수정에 실패했습니다.');
                        } finally {
                            input.remove();
                            span.style.display = '';
                        }
                    };

                    input.addEventListener('blur', saveChanges);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            input.blur();
                        } else if (e.key === 'Escape') {
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
            tagList.querySelectorAll('li.user-tag').forEach(li => li.remove());

            tags.forEach(tag => {
                const li = document.createElement('li');
                li.classList.add('user-tag');

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

                li.appendChild(a);
                tagList.appendChild(li);
            });
        };

        let currentFilter = {};

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
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const user = parseJwt(token);
        if (user && userNicknameSpan) {
            userNicknameSpan.textContent = (user.nickname || user.username) + ' 님';
        }

        // 태그 생성 폼 처리
        if (tagForm) {
            tagForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const tagInput = document.getElementById('tag-input');
                const name = tagInput.value.trim();

                if (!name) return;

                try {
                    const response = await fetch(`${apiBaseUrl}/tags`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ name })
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message || 'Failed to create tag');
                    
                    tagInput.value = '';
                    fetchTags();
                    fetchAndRenderTagsForModal();
                } catch (error) {
                    console.error('Error creating tag:', error);
                    alert(`태그 생성 실패: ${error.message}`);
                }
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

        // --- 태그 관리 모달 ---
        const tagModal = document.getElementById('tag-modal');
        const manageTagsBtn = document.getElementById('manage-tags-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modalTagList = document.getElementById('modal-tag-list');

        // 모달 열기
        manageTagsBtn.addEventListener('click', () => {
            tagModal.classList.remove('hidden');
            fetchAndRenderTagsForModal();
        });

        // 모달 닫기
        closeModalBtn.addEventListener('click', () => {
            tagModal.classList.add('hidden');
        });

        tagModal.addEventListener('click', (e) => {
            if (e.target === tagModal) { // 오버레이 클릭 시 닫기
                tagModal.classList.add('hidden');
            }
        });

        // 모달용 태그 목록 불러오기 및 렌더링
        const fetchAndRenderTagsForModal = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/tags`, { headers: getAuthHeaders() });
                if (!response.ok) throw new Error('Failed to fetch tags');
                const tags = await response.json();
                renderTagsInModal(tags);
            } catch (error) {
                console.error('Error fetching tags for modal:', error);
                modalTagList.innerHTML = '<li>태그를 불러오는 데 실패했습니다.</li>';
            }
        };

        // 모달에 태그 목록 렌더링
        const renderTagsInModal = (tags) => {
            modalTagList.innerHTML = '';
            tags.forEach(tag => {
                const li = document.createElement('li');
                li.dataset.tagId = tag.id;

                const tagNameSpan = document.createElement('span');
                tagNameSpan.className = 'tag-name-span';
                tagNameSpan.textContent = tag.name;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-tag-modal-btn';
                deleteBtn.textContent = '삭제';

                li.appendChild(tagNameSpan);
                li.appendChild(deleteBtn);
                modalTagList.appendChild(li);

                // 삭제 이벤트 리스너
                deleteBtn.addEventListener('click', async () => {
                    if (confirm(`'${tag.name}' 태그를 정말 삭제하시겠습니까?`)) {
                        try {
                            const response = await fetch(`${apiBaseUrl}/tags/${tag.id}`, {
                                method: 'DELETE',
                                headers: getAuthHeaders()
                            });
                            if (!response.ok) throw new Error('Failed to delete tag');
                            
                            fetchTags();
                            fetchAndRenderTagsForModal();
                        } catch (error) {
                            console.error('Error deleting tag:', error);
                            alert('태그 삭제에 실패했습니다.');
                        }
                    }
                });

                // 수정 이벤트 리스너 (span 더블클릭)
                tagNameSpan.addEventListener('dblclick', () => {
                    const currentName = tagNameSpan.textContent;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentName;
                    li.replaceChild(input, tagNameSpan);
                    input.focus();

                    const saveTagChanges = async () => {
                        const newName = input.value.trim();
                        if (!newName || newName === currentName) {
                            li.replaceChild(tagNameSpan, input);
                            return;
                        }

                        try {
                            const response = await fetch(`${apiBaseUrl}/tags/${tag.id}`, {
                                method: 'PUT',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ name: newName })
                            });

                            const result = await response.json();

                            if (!response.ok) {
                                throw new Error(result.message || 'Failed to update tag');
                            }
                            
                            fetchTags();
                            fetchAndRenderTagsForModal();
                        } catch (error) {
                            console.error('Error updating tag:', error);
                            alert(`태그 수정 실패: ${error.message}`);
                            li.replaceChild(tagNameSpan, input);
                        }
                    };

                    input.addEventListener('blur', saveTagChanges);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') input.blur();
                        if (e.key === 'Escape') li.replaceChild(tagNameSpan, input);
                    });
                });
            });
        };
    }
});
