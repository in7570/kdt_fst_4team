import { useState } from 'react';
import TitleBox from './components/TitleBox';
import InputBox from './components/InputBox';
import Cards from './components/Cards';

import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  // let todos=[];
  // onAdd prop을 통해 InputBox 컴포넌트에서 새로운 할 일이 추가될 때마다 todos 상태를 업데이트합니다.
  // onAdd는 들어온 값을 setTodos를 통해 todos배열에 추가함
  return (
    <div className='root'>
      <TitleBox />
      <InputBox onAdd={(value) => setTodos((prev) => [...prev, value])} />
      <Cards
        items={todos}
        onDelete={
          (index) => setTodos((prev) => prev.filter((_, i) => i !== index))
          // filter를 사용하여 할 일을 삭제한다.
          // filter는 조건에 맞는 요소들로만 새로운 배열을 만듦
          // index는 삭제할 요소의 인덱스, i는 현재 요소의 인덱스
          // i가 index와 같지 않은 요소들만 남겨서 새로운 배열을 만듦
        }
      />
    </div>
  );
}

export default App;
