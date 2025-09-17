import { useState } from 'react';
import styles from './css/InputBox.module.css';

function InputBox({ onAdd }) {
  const [inputValue, setInputValue] = useState('');

  const insertList = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={styles.container}>
      <input
        type='text'
        className={styles.input}
        placeholder='할 일을 입력하세요'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            insertList();
          }
        }}
      />
      <button onClick={insertList}>추가</button>
    </div>
  );
}

export default InputBox;
