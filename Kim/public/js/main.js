document.addEventListener('DOMContentLoaded', () => {

    // --- 공통 변수 및 함수 ---
    const apiBaseUrl = '/api';
    const token = localStorage.getItem('token');
    const COLOR_PALETTE = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FADADD', '#E0E0E0'];

    // 인증 토큰을 포함한 요청 헤더를 생성하는 함수
    const getAuthHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
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
            window.location.href = MESSAGES.LOGIN_PAGE;
        });
    }

    // --- 범용 폼 제출 핸들러 ---
    const handleFormSubmit = (formId, apiUrl, options = {}) => {
        const form = document.getElementById(formId);
        if (!form) return;

        const { method = 'POST', getPayload, onSuccess, preSubmitValidation } = options;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (preSubmitValidation && !preSubmitValidation(form)) {
                return; // 유효성 검사 실패 시 중단
            }

            const payload = getPayload(form);

            try {
                const response = await fetch(apiUrl, {
                    method: method,
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    if (onSuccess) onSuccess(result);
                } else {
                    alert(result.message || MESSAGES.ERROR_DEFAULT);
                }
            } catch (error) {
                console.error(`${formId} 처리 중 오류:`, error);
                alert(MESSAGES.ERROR_DEFAULT);
            }
        });
    };

    // --- 회원 관리 (리팩토링된 폼 처리) ---
    handleFormSubmit('login-form', `${apiBaseUrl}/users/login`, {
        getPayload: (form) => ({
            username: form.username.value,
            password: form.password.value
        }),
        onSuccess: (result) => {
            localStorage.setItem('token', result.token);
            window.location.href = MESSAGES.LOGIN_SUCCESS_REDIRECT;
        }
    });

    handleFormSubmit('register-form', `${apiBaseUrl}/users/register`, {
        preSubmitValidation: (form) => {
            if (form.password.value !== form['password-confirm'].value) {
                alert(MESSAGES.PASSWORD_MISMATCH);
                return false;
            }
            return true;
        },
        getPayload: (form) => ({
            username: form.username.value,
            password: form.password.value,
            nickname: form.nickname.value
        }),
        onSuccess: () => {
            alert(MESSAGES.REGISTER_SUCCESS);
            window.location.href = MESSAGES.LOGIN_PAGE;
        }
    });

    handleFormSubmit('forgot-password-form', `${apiBaseUrl}/users/find-password`, {
        getPayload: (form) => ({
            username: form.username.value,
            nickname: form.nickname.value
        }),
        onSuccess: (result) => {
            alert(MESSAGES.TEMP_PASSWORD_ISSUED(result.tempPassword));
            window.location.href = MESSAGES.LOGIN_PAGE;
        }
    });

    handleFormSubmit('change-password-form', `${apiBaseUrl}/users/change-password`, {
        method: 'PUT',
        preSubmitValidation: (form) => {
            if (form['new-password'].value !== form['new-password-confirm'].value) {
                alert(MESSAGES.NEW_PASSWORD_MISMATCH);
                return false;
            }
            return true;
        },
        getPayload: (form) => ({
            currentPassword: form['current-password'].value,
            newPassword: form['new-password'].value
        }),
        onSuccess: () => {
            alert(MESSAGES.PASSWORD_CHANGE_SUCCESS);
            localStorage.removeItem('token');
            window.location.href = MESSAGES.LOGIN_PAGE;
        }
    });


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

        // --- 투두리스트 렌더링 로직 (리팩토링) ---

        // 1. 할 일(Todo) DOM 엘리먼트 생성
        const createTodoElement = (todo) => {
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
            return li;
        };

        // 2. 할 일(Todo) 엘리먼트에 이벤트 리스너 추가
        const attachTodoEventListeners = (li, todo) => {
            const checkboxContainer = li.querySelector('.checkbox-container');
            const deleteBtn = li.querySelector('.delete-btn');
            const span = li.querySelector('span');

            // 완료/미완료 처리
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
                    alert(MESSAGES.TODO_UPDATE_FAILED);
                }
            });

            // 삭제 처리
            deleteBtn.addEventListener('click', async () => {
                if (confirm(MESSAGES.TODO_DELETE_CONFIRM)) {
                    await fetch(`${apiBaseUrl}/todos/${todo.id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    li.remove();
                }
            });

            // 더블클릭으로 수정 처리
            span.addEventListener('click', (e) => e.stopPropagation());
            span.addEventListener('dblclick', () => {
                const currentContent = span.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentContent;
                input.addEventListener('click', (e) => e.stopPropagation());
                
                const checkboxDiv = li.querySelector('.checkbox-container');
                checkboxDiv.replaceChild(input, span);
                input.focus();

                const saveChanges = async () => {
                    const newContent = input.value.trim();
                    if (!newContent || newContent === currentContent) {
                        checkboxDiv.replaceChild(span, input);
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
                        alert(MESSAGES.TODO_CONTENT_UPDATE_FAILED);
                    } finally {
                        checkboxDiv.replaceChild(span, input);
                    }
                };

                input.addEventListener('blur', saveChanges);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') input.blur();
                    else if (e.key === 'Escape') {
                        checkboxDiv.replaceChild(span, input);
                    }
                });
            });
        };

        // 3. 전체 할 일 목록 렌더링 (재구성된 함수)
        const renderTodos = (todos) => {
            if (!todoList) return;
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = createTodoElement(todo);
                attachTodoEventListeners(li, todo);
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
                    alert(MESSAGES.ERROR_UNAUTHORIZED);
                    localStorage.removeItem('token');
                    window.location.href = MESSAGES.LOGIN_PAGE;
                    return;
                }
                const todos = await response.json();
                renderTodos(todos);
            } catch (error) {
                console.error(MESSAGES.TODO_FETCH_FAILED, error);
            }
        };

        const fetchTags = async () => {
            if (!tagList) return;
            try {
                const response = await fetch(`${apiBaseUrl}/tags`, { headers: getAuthHeaders() });
                const tags = await response.json();
                renderTags(tags);
            } catch (error) {
                console.error(MESSAGES.TAG_FETCH_FAILED, error);
            }
        };

        const updateActiveFilter = (clickedElement) => {
            document.querySelectorAll('.sidebar a.active').forEach(el => el.classList.remove('active'));
            if (clickedElement) clickedElement.classList.add('active');
        };

        // 정적 필터(전체, 미완료, 완료)에 이벤트 리스너 추가
        const setupStaticFilters = () => {
            const filters = {
                'filter-all': {},
                'filter-incomplete': { is_completed: 'false' },
                'filter-completed': { is_completed: 'true' }
            };

            for (const id in filters) {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        fetchTodos(filters[id]);
                        updateActiveFilter(element);
                    });
                }
            }
        };

        if (!token) {
            window.location.href = MESSAGES.LOGIN_PAGE;
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
                alert(MESSAGES.TAG_CREATE_FAILED(error.message));
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
                            alert(MESSAGES.TAG_COLOR_UPDATE_FAILED(error.message));
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
                    if (confirm(MESSAGES.TAG_DELETE_CONFIRM(tag.name))) {
                        try {
                            await fetch(`${apiBaseUrl}/tags/${tag.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                            fetchTags();
                            fetchAndRenderTagsForModal();
                        } catch (error) {
                            alert(MESSAGES.TAG_DELETE_FAILED);
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
                            alert(MESSAGES.TAG_UPDATE_FAILED(error.message));
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
            fetchTodos({});
            updateActiveFilter(document.getElementById('filter-all'));
        });
    }
});