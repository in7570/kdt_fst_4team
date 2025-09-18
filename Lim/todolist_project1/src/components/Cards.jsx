import styles from './css/Cards.module.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function Cards({ items, onDelete, onDragEnd }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='todos'>
        {(provided) => (
          <ul
            className={styles.card}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items.map((todo, index) => (
              <Draggable
                key={todo.id}
                draggableId={String(todo.id)}
                index={index}
              >
                {(provided) => (
                  <li
                    className={styles.listItem}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <button
                      className={styles.deleteButton}
                      onClick={() => onDelete(todo.id)}
                    >
                      ➖
                    </button>
                    <span className={styles.listText}>{todo.text}</span>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default Cards;
