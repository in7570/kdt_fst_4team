document.addEventListener('DOMContentLoaded', () => {

    // --- 공통 변수 및 함수 ---
    const apiBaseUrl = '/api';
    const token = localStorage.getItem('token');
    const COLOR_PALETTE = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FADADD', '#E0E0E0'];

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
                }
            } catch (error) {
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
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
        }

        if (dropdown) {
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        window.addEventListener('click', () => {
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
            const colorPalette = document.getElementById('color-palette');
            if (colorPalette && !colorPalette.classList.contains('hidden')) {
                colorPalette.classList.add('hidden');
            }
        });

        const renderTodos = (todos) => {
            if (!todoList) return;
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.dataset.id = todo.id;
                if (todo.is_completed) {
                    li.classList.add('checked');
                }
                li.innerHTML = `
                    <div class="checkbox-container">
                        <div class="checkbox"></div>
                        <span>${todo.content}</span>
                    </div>
                    <button class="delete-btn">×</button>
                `;
                const checkboxContainer = li.querySelector('.checkbox-container');
                checkboxContainer.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const isCompleted = !li.classList.contains('checked');
                    try {
                        await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                            method: 'PUT',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ is_completed: isCompleted })
                        });
                        li.classList.toggle('checked');
                    } catch (error) {
                        console.error('Error updating todo:', error);
                        alert('항목 업데이트에 실패했습니다.');
                    }
                });
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
                const span = li.querySelector('span');
                span.addEventListener('click', (e) => e.stopPropagation());
                span.addEventListener('dblclick', () => {
                    const currentContent = span.textContent;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentContent;
                    input.addEventListener('click', (e) => e.stopPropagation());
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
                            await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                                method: 'PUT',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ content: newContent })
                            });
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
                        if (e.key === 'Enter') input.blur();
                        else if (e.key === 'Escape') {
                            input.remove();
                            span.style.display = '';
                        }
                    });
                });
                todoList.appendChild(li);
            });
        };

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
                a.style.backgroundColor = tag.color;
                a.style.borderColor = tag.color;
                a.style.color = '#fff';
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

        const fetchTodos = async (filter = {}) => {
            currentFilter = filter;
            let url = new URL(`${window.location.origin}${apiBaseUrl}/todos`);
            Object.keys(filter).forEach(key => url.searchParams.append(key, filter[key]));
            try {
                const response = await fetch(url, { headers: getAuthHeaders() });
                if (response.status === 401 || response.status === 403) {
                    alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return;
                }
                const todos = await response.json();
                renderTodos(todos);
            } catch (error) {
                console.error('할 일 목록을 불러오는 데 실패했습니다:', error);
            }
        };

        const fetchTags = async () => {
            if (!tagList) return;
            try {
                const response = await fetch(`${apiBaseUrl}/tags`, { headers: getAuthHeaders() });
                const tags = await response.json();
                renderTags(tags);
            } catch (error) {
                console.error('태그 목록을 불러오는 데 실패했습니다:', error);
            }
        };

        const updateActiveFilter = (clickedElement) => {
            document.querySelectorAll('.sidebar a.active').forEach(el => el.classList.remove('active'));
            if (clickedElement) clickedElement.classList.add('active');
        };

        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const user = parseJwt(token);
        if (user && userNicknameSpan) {
            userNicknameSpan.textContent = (user.nickname || user.username) + ' 님';
        }

        const tagModal = document.getElementById('tag-modal');
        const manageTagsBtn = document.getElementById('manage-tags-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modalTagList = document.getElementById('modal-tag-list');
        const colorPalette = document.getElementById('color-palette');

        manageTagsBtn.addEventListener('click', () => {
            tagModal.classList.remove('hidden');
            fetchAndRenderTagsForModal();
        });

        closeModalBtn.addEventListener('click', () => tagModal.classList.add('hidden'));
        tagModal.addEventListener('click', (e) => {
            if (e.target === tagModal) tagModal.classList.add('hidden');
        });

        const fetchAndRenderTagsForModal = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/tags`, { headers: getAuthHeaders() });
                const tags = await response.json();
                renderTagsInModal(tags);
            } catch (error) {
                console.error('Error fetching tags for modal:', error);
            }
        };

        tagForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tagInput = document.getElementById('tag-input');
            const name = tagInput.value.trim();
            if (!name) return;

            try {
                const tagsResponse = await fetch(`${apiBaseUrl}/tags`, { headers: getAuthHeaders() });
                const existingTags = await tagsResponse.json();
                const usedColors = existingTags.map(tag => tag.color);
                const availableColor = COLOR_PALETTE.find(color => !usedColors.includes(color));

                const response = await fetch(`${apiBaseUrl}/tags`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ name, color: availableColor })
                });
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.message || 'Failed to create tag');
                }
                tagInput.value = '';
                fetchTags();
                fetchAndRenderTagsForModal();
            } catch (error) {
                console.error('Error creating tag:', error);
                alert(`태그 생성 실패: ${error.message}`);
            }
        });

        const showColorPalette = (tag, allTags, targetElement) => {
            colorPalette.innerHTML = '';
            const usedColors = allTags.map(t => t.color);
            const rect = targetElement.getBoundingClientRect();
            colorPalette.style.top = `${rect.bottom + window.scrollY}px`;
            colorPalette.style.left = `${rect.left + window.scrollX}px`;

            COLOR_PALETTE.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                const isUsed = usedColors.includes(color) && tag.color !== color;
                if (isUsed) {
                    swatch.classList.add('disabled');
                } else {
                    swatch.addEventListener('click', async () => {
                        try {
                            const response = await fetch(`${apiBaseUrl}/tags/${tag.id}`, {
                                method: 'PUT',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ color })
                            });
                            if (!response.ok) {
                                const result = await response.json();
                                throw new Error(result.message || 'Failed to update color');
                            }
                            fetchTags();
                            fetchAndRenderTagsForModal();
                        } catch (error) {
                            alert(`색상 변경 실패: ${error.message}`);
                        }
                        colorPalette.classList.add('hidden');
                    });
                }
                colorPalette.appendChild(swatch);
            });
            colorPalette.classList.remove('hidden');
        };

        const renderTagsInModal = (tags) => {
            modalTagList.innerHTML = '';
            tags.forEach(tag => {
                const li = document.createElement('li');
                li.dataset.tagId = tag.id;

                const colorBox = document.createElement('div');
                colorBox.className = 'tag-color-box';
                colorBox.style.backgroundColor = tag.color;
                colorBox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showColorPalette(tag, tags, e.target);
                });

                const tagNameSpan = document.createElement('span');
                tagNameSpan.className = 'tag-name-span';
                tagNameSpan.textContent = tag.name;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-tag-modal-btn';
                deleteBtn.textContent = '삭제';

                const controls = document.createElement('div');
                controls.style.display = 'flex';
                controls.style.alignItems = 'center';

                li.appendChild(controls);
                controls.appendChild(colorBox);
                controls.appendChild(tagNameSpan);
                li.appendChild(deleteBtn);

                modalTagList.appendChild(li);

                deleteBtn.addEventListener('click', async () => {
                    if (confirm(`'${tag.name}' 태그를 정말 삭제하시겠습니까?`)) {
                        try {
                            await fetch(`${apiBaseUrl}/tags/${tag.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                            fetchTags();
                            fetchAndRenderTagsForModal();
                        } catch (error) {
                            alert('태그 삭제에 실패했습니다.');
                        }
                    }
                });

                tagNameSpan.addEventListener('dblclick', () => {
                    const currentName = tagNameSpan.textContent;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentName;
                    controls.replaceChild(input, tagNameSpan);
                    input.focus();

                    const saveTagChanges = async () => {
                        const newName = input.value.trim();
                        if (!newName || newName === currentName) {
                            controls.replaceChild(tagNameSpan, input);
                            return;
                        }
                        try {
                            await fetch(`${apiBaseUrl}/tags/${tag.id}`, {
                                method: 'PUT',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ name: newName })
                            });
                            fetchTags();
                            fetchAndRenderTagsForModal();
                        } catch (error) {
                            alert(`태그 수정 실패: ${error.message}`);
                            controls.replaceChild(tagNameSpan, input);
                        }
                    };
                    input.addEventListener('blur', saveTagChanges);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') input.blur();
                        if (e.key === 'Escape') controls.replaceChild(tagNameSpan, input);
                    });
                });
            });
        };

        fetchTodos({});
        fetchTags();
        if (document.getElementById('filter-all')) {
            updateActiveFilter(document.getElementById('filter-all'));
        }

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
