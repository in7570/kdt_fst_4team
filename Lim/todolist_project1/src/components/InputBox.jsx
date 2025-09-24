import { useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './css/InputBox.module.css';
import Categories from './Categories';

function InputBox({ onAdd }) {
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('할일');

  const insertList = () => {
    if (inputValue === '') toast.error('입력해주세요~!');
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
      setSelectedCategory('할일');
    }
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 동작 방지 (줄바꿈 방지)
      if (e.nativeEvent.isComposing) return; // 한글 입력 중일 때는 무시
      insertList();
    }
  };
  const onChange = (e) => {
    setSelectedCategory(e.target.value);
    console.log(e.target.value);
  };

  return (
    <>
      <div className={styles.container}>
        <input
          type='text'
          className={styles.input}
          placeholder='할 일을 입력하세요'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button onClick={insertList}>➕</button>
      </div>
      {/* <Categories onChange={onChange(e)} /> */}
    </>
  );
}

export default InputBox;
