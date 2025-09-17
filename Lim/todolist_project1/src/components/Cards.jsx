import styles from './css/Cards.module.css';

function Cards({ items, onDelete }) {
  return (
    <ul className={styles.card}>
      {items.map((todo, index) => (
        <li key={index} className={styles.listItem}>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(index)}
          >
            완료
          </button>
          <span className={styles.listText}>{todo}</span>
        </li>
      ))}
    </ul>
  );
}

export default Cards;
