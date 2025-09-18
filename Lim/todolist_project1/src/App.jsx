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
  };
  const onDelete = (todoId) => {
    setTodos((prev) => prev.filter((e) => e.id !== todoId));
  };
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return; // 드래그가 유효한지 확인
    // 아이템이 같은 위치로 드래그된 경우 빠져나옴
    if (source.index === destination.index) return;
    const updatedTodos = Array.from(todos);
    // Array.from : 유사 배열 객체나 반복 가능한 객체를 얕게 복사하여 새로운 배열 객체를 생성
    const [movedItem] = updatedTodos.splice(source.index, 1);
    updatedTodos.splice(destination.index, 0, movedItem);
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
