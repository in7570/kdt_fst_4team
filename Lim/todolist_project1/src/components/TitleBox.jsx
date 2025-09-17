import Icon from '../assets/pencil.svg';
import styles from './css/TitleBox.module.css';

function TitleBox() {
  return (
    <div className={styles.container}>
      <p className={styles.title}>&nbsp;TODO&nbsp;LIST&nbsp;</p>
      <img src={Icon} className={styles.icon} alt='Icon' />
    </div>
  );
}

export default TitleBox;
