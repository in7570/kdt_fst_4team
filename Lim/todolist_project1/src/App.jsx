import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import TitleBox from './components/TitleBox';
import InputBox from './components/InputBox';
import Cards from './components/Cards';

import './App.css';

function App() {
  // localStorage에서 데이터 불러오기 (초기값 설정)
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todolist-todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  // const [selectedCategory, setSelectedCategory] = useState(() => {
  //   const savedCategory = localStorage.getItem('todolist-category');
  //   return savedCategory || '할일';
  // });

  // todos가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('todolist-todos', JSON.stringify(todos));
  }, [todos]);

  // useEffect(() => {
  //   localStorage.setItem('todolist-category', selectedCategory);
  // }, [selectedCategory]);

  const onAdd = (text, category) => {
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text, category, deleting: false },
    ]);
    setSelectedCategory(category);
    // ...prev : 기존 배열 복사
  };
  const onDelete = (todoId) => {
    // 먼저 deleting 상태로 변경 (취소선 애니메이션 시작)
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, deleting: true } : todo
      )
    );

    // 0.3초 후 실제 삭제 (취소선 애니메이션 완료 후)
    setTimeout(() => {
      setTodos((prev) => prev.filter((e) => e.id !== todoId));
    }, 300);
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
