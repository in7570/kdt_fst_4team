import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import TitleBox from './components/TitleBox';
import InputBox from './components/InputBox';
import Cards from './components/Cards';

import './App.css';

function App() {
  const [todos, setTodos] = useState([]);

  const onAdd = (text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text }]);
    // ...prev : 기존 배열 복사
    // 예를 들어, todos가 [{id:1, text:'task1'}] 였다면
    // onAdd('task2') 호출 후에는 [{id: 1, text:'task1'}, {id: 2, text:'task2'}] 가 됨
  };

  const onDelete = (todoId) => {
    // _: 언더스코어는 사용하지 않는 매개변수를 나타낼 때 관례적으로 사용
    //
    setTodos((prev) => prev.filter((e) => e.id !== todoId));
    // 지금 보고있는 요소의 id가 삭제할 요소의 id와 다른가요?
    // 그렇다면 값을 반환합시다(배열로)
    // 아니라면 필터링합시다
    // 원래는 index로 했는데 버그를 유발한대서 id로 바꾸었따

    // 현재요소의 인덱스 i 가 삭제할 요소의 index와 같지 않으면 남김
    // filter는 true인 요소만 남기고 false인 요소는 제거
    // 즉 현재요소와 삭제할 요소가 같으면 false가 되서 제거됨
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    // onDragEnd인자 result는 { source, destination, draggableId, ...} 구조임
    // 드래그가 유효한지 확인
    if (!destination) return;

    // 아이템이 같은 위치로 드래그된 경우
    if (source.index === destination.index) return;
    // 아이템 재배치
    const updatedTodos = Array.from(todos);
    // Array.from : 유사 배열 객체나 반복 가능한 객체를 얕게 복사하여 새로운 배열 객체를 생성
    const [movedItem] = updatedTodos.splice(source.index, 1);
    // source.index 위치에서 1개의 요소를 제거하고, 제거된 요소를 movedItem에 저장
    // => 결국 source index 위치의 요소를 배열에 넣은거임 원본 배열에서는 삭제!!
    // 근데 사실상 todos 복제본이라서 todos에는 영향 x

    updatedTodos.splice(destination.index, 0, movedItem);
    // .splice(삽입할 위치, 삭제할 요소의 개수, 삽입할 요소)
    // 목적지에 movedItem 삽입
    setTodos(updatedTodos);
  };
  return (
    <div className='root'>
      <Toaster />
      <TitleBox />
      <InputBox onAdd={onAdd} />
      <Cards items={todos} onDelete={onDelete} onDragEnd={onDragEnd} />
    </div>
  );
}

export default App;
