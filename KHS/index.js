/** index.html */
const profileButton = document.getElementById('profile-button');
const profileFrame = document.getElementById('profile-frame');
const profileName = document.getElementById('profile-name');
const listContainer = document.getElementById('list-container');
const todoInput = document.getElementById('todo-input');
const todoTemplate = document.querySelector('.todo-item');
const form = document.getElementById('todo-form');
const subListContainerButton = document.querySelector('.sub-list-container-button');
const tagButtonContainer = document.getElementById('tag-button-container');
const tagAllButton = document.getElementById('tag-all');

// TODO: 계정 닉네임을 띄우도록 수정
profileButton.addEventListener('click', (event) => {
    profileFrame.classList.toggle('hidden');
});

// TODO: 컨테이너 만들고 오늘, 중요 버튼 이벤트 리스너 생성
// TODO: 사이드바 태그 버튼 누른 다음 전체 눌렀을 때 색 변하지 않는 버그 수정
tagAllButton.addEventListener('click', (event) => {
    const todoListAll = document.querySelectorAll('.todo-item:not(:first-child)');
    todoListAll.forEach((e) => {
        e.classList.remove('hidden');
    });
});

tagButtonContainer.addEventListener('click', (event) => {
    if(event.target.tagName !== 'BUTTON') return;
    const todoListAll = document.querySelectorAll('.todo-item:not(:first-child)');
    const colorList = ['bg-gray-200', 'bg-work', 'bg-promise', 'bg-study', 'bg-exercise', 'bg-hobby', 'bg-gray-400', 'bg-work-dark', 'bg-promise-dark', 'bg-study-dark', 'bg-exercise-dark', 'bg-hobby-dark'];
    const clickedColor = colorList.find((c) => event.target.classList.contains(c));

    // 1. focus 상태의 태그를 클릭한 경우
    if(isGray400(clickedColor) || isDark(clickedColor)) return;

    // 2. focus 상태가 아닌 태그를 클릭한 경우: 그 전 focus 태그의 배경색을 기본으로 돌리고 focus 태그의 배경색을 dark로 만들기
    // 클릭 이벤트 핸들러가 실행되는 시점에는 focus 상태가 적용되기 전이라 focus 상태인 태그는 그 전 태그 하나가 유일함
    const selected = Array.from(tagButtonContainer.children).find((c) => c.classList.contains('selected'));

    if(selected) {
        const selectedColor = colorList.find((c) => selected.classList.contains(c));
        if(selectedColor) {
            const selectedChangeColor = isGray400(selectedColor) ? selectedColor.replace('400', '200') : selectedColor.slice(0, -5);
            selected.classList.remove(selectedColor, 'selected');
            selected.classList.add(selectedChangeColor);
        }
    }

    const changeColor = isGray200(clickedColor) ? clickedColor.replace('200', '400') : clickedColor + '-dark';
    event.target.classList.remove(clickedColor);
    event.target.classList.add(changeColor, 'selected');

    todoListAll.forEach((e) => {
        e.classList.contains(clickedColor) ? e.classList.remove('hidden') : e.classList.add('hidden');
    });
});

function isGray200(color) {
    return /200$/.test(color);
}

function isGray400(color) {
    return /400$/.test(color);
}

function isDark(color) {
    return /-dark$/.test(color);
}


form.addEventListener('submit', (event) => {
    // input 필드가 form 태그 안에 있을 때 Enter 키 누르면 form을 제출하고 
    // 페이지를 새로고침하는 브라우저의 기본 동작이 존재
    event.preventDefault();
    createList();
});

// TODO: 중복 내용 추가 방지 기능 (input을 db에 저장해놓고 추가할 때마다 순회해서 탐색하고 겹치면 alert)
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
            checkItem(todoItem);
            break;
        case 'details':
            openCloseSubText(todoItem);
            break;
        case 'delete':
            event.preventDefault();
            deleteItem(todoItem);
            break;
        case 'time':
            setTimer(subListContainer);
            break;
        case 'text':
            writeText(actionTarget);
            break;
        case 'tag':
            setTag(subListContainer, actionTarget);
            break;
    }
});


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


function openCloseSubText(todoItem) {
    return;
}


function deleteItem(todoItem) {
    todoItem.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        todoItem.remove();
    }, 300);
}


function setTimer(subListContainer) {
    const dateInput = subListContainer.querySelector('.date-input');
    dateInput.classList.toggle('hidden');
    const timeDisplay = subListContainer.closest('.todo-item').querySelector('.todo-time');
    const fp = flatpickr(dateInput, {
        locale: "ko",
        enableTime: true,
        time_24hr: true,
        dateFormat: 'm-d H:i',
        minDate: 'today',
        onChange: function(selectedDates, dateStr, instance) {
            timeDisplay.textContent = dateStr.split(' ')[0];
            dateInput.value = dateStr;
        }
    });
    if(!dateInput.classList.contains('hidden')) fp.open();
}


function writeText(actionTarget) {
    const detailsInput = actionTarget.nextElementSibling;
    detailsInput.classList.toggle('hidden');
}


function setTag(subListContainer, actionTarget) {
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
    return;
}