import styles from './css/Categories.module.css';

function Categories() {
  const categoryMap = { 1: '할일', 2: '살것', 3: '공부', 4: '기타' };
  return (
    <>
      <select className={styles.container}>
        {/* Object.entries : 객체의 [key, value] 쌍을 배열로 반환 */}
        {Object.entries(categoryMap).map(([index, value]) => (
          <option key={index} value={index}>
            {value}
          </option>
        ))}
      </select>
    </>
  );
}

export default Categories;
