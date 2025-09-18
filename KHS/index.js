/** index.html */
const profileButton = document.getElementById('profile-button');
const profileFrame = document.getElementById('profile-frame');
const profileName = document.getElementById('profile-name');
const listContainer = document.getElementById('list-container');
const todoInput = document.getElementById('todo-input');
const todoTemplate = document.querySelector('.todo-item');
const form = document.getElementById('todo-form');
const subListContainerButton = document.querySelector('.sub-list-container-button');

// 프로필 버튼 클릭하면 사용자이름/(로그인/로그아웃) 프레임 토글
profileButton.addEventListener('click', (event) => {
    profileFrame.classList.toggle('hidden');
});



// 추가 버튼 or Enter 누르면 리스트 생성
form.addEventListener('submit', (event) => {
    // input 필드가 form 태그 안에 있을 때 Enter 키 누르면 form을 제출하고 
    // 페이지를 새로고침하는 브라우저의 기본 동작이 존재
    // DB 사용하면 삭제해도 될듯
    event.preventDefault();
    createList();
});

// 리스트 생성
// 중복 내용 추가 방지 기능 만들어도 재밌을듯
// input을 db에 저장해놓고 추가할 때마다 순회해서 탐색하고 겹치면 alert
function createList() {
    let input_value = todoInput.value;
    if(!input_value.trim()) {
        alert('할 일을 입력해주세요.');
        return;
    }
    const newList = todoTemplate.cloneNode(true);
    newList.querySelector('.todo-text').textContent = input_value;
    listContainer.append(newList);
    setTimeout(() => {
        newList.classList.remove('hidden', 'opacity-0', 'scale-95');
    }, 10);
    todoInput.value = '';
}

listContainer.addEventListener('click', (event) => {
    const target = event.target;
    const actionTarget = target.closest('[data-action]');
    
    if(!actionTarget) return;
    
    const action = actionTarget.dataset.action;
    const todoItem = actionTarget.closest('.todo-item');
    const subListContainer = actionTarget.closest('.sub-list-container');

    switch(action) {
        case 'check':
            event.preventDefault();
            checkItem(todoItem); // 체크박스 클릭
            break;
        case 'details':
            openCloseSubText(todoItem); // 내용 클릭
            break;
        case 'delete':
            event.preventDefault();
            deleteItem(todoItem); // 삭제 버튼 클릭
            break;
        case 'time':
            setTimer(subListContainer);
            break;
        case 'text':
            writeText(subListContainer);
            break;
        case 'tag':
            setTag(subListContainer, actionTarget);
            break;
    }
});

// 체크박스 클릭
function checkItem(todoItem) {
    const unCheckedIcon = todoItem.querySelector('.fa-square');
    const checkedIcon = todoItem.querySelector('.fa-square-check');
    const textSummary = todoItem.querySelector('.todo-text');
    setTimeout(() => {
        unCheckedIcon.classList.toggle('hidden');
        checkedIcon.classList.toggle('hidden');
        textSummary.classList.toggle('text-gray-500');
        textSummary.classList.toggle('decoration-gray-500');
        textSummary.classList.toggle('line-through');
    }, 100);
}

// 내용 클릭 -> details 사용으로 인해 필요 없어진 것 같음
function openCloseSubText(todoItem) {
    return;
}

// 삭제 버튼 클릭
function deleteItem(todoItem) {
    todoItem.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        todoItem.remove();
    }, 300);
}

// subListContainerButton.addEventListener('click', (event) => {
//     const target = event.target;
//     const actionTarget = target.closest('[data-action]');

//     if(!actionTarget) return;

//     const action = actionTarget.dataset.action;
//     const subListContainer = actionTarget.closest('.sub-list-container');

//     switch(action) {
//         case 'time':
//             setTimer(subListContainer);
//             break;
//         case 'text':
//             writeText(subListContainer);
//             break;
//         case 'tag':
//             setTag(subListContainer, actionTarget);
//             break;
//     }
// });

// 마감 기한 클릭
function setTimer(subListContainer) {
    return;
}

// 세부 내용 클릭
function writeText(subListContainer) {
    return;
}

// 태그 선택 클릭
function setTag(subListContainer, actionTarget) {
    // 리스트 색 바꿈
    const tagList = actionTarget.nextElementSibling;
    tagList.classList.toggle('hidden');
    tagList.addEventListener('click', (e) => {
        if(e.target.tagName !== 'BUTTON') return;
        let color = 'bg-gray-200';
        const parentList = subListContainer.closest('.todo-item');
        const colorList = ['bg-gray-200', 'bg-work', 'bg-promise', 'bg-study', 'bg-exercise', 'bg-hobby'];
        parentList.classList.remove(...colorList);
        const clickedColor = colorList.find((c) => e.target.classList.contains(c));
        if(clickedColor) color = clickedColor;
        parentList.classList.add(color);
    });

    // 태그 리스트에 저장 or 태그값 저장
    // 사이드바 태그 클릭시 리스트에 있거나 값 같은 리스트만 보이게 설정
    return;
}