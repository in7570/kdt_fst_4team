import styles from './css/Cards.module.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function Cards({ items, onDelete, onDragEnd }) {
  // droppableId: 드롭 가능한 영역을 식별하는 고유한 문자열
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='todos'>
        {(provided) => (
          // provided: Droppable 컴포넌트가 자식 함수에 전달하는 객체로,
          // 드롭 가능한 영역을 설정하는 데 필요한 속성과 메서드를 포함

          // 밑에 세 줄이 이해가 안가서 주석을 읽어봤는데 대충 필요해서 넣는거 같음

          // ref={provided.innerRef} : 드롭 가능한 영역의 DOM 노드에 대한 참조를 설정
          // {...provided.droppableProps} : 드롭 가능한 영역에 필요한 속성들을 설정
          // 이 두가지를 설정해야 드래그 앤 드롭이 정상 작동
          // (이거 안하면 콘솔에 경고 뜸)
          // 이게 무슨 말인지 모르겠어서 이해하기 쉽게 설명하자면
          // provided.droppableProps 안에 드롭 가능한 영역을 설정하는 데 필요한 여러 속성들이 들어있음
          // 예를 들어, 드롭 가능한 영역의 이벤트 핸들러나 스타일 등이 포함될 수 있음
          // 이 속성들을 드롭 가능한 영역의 최상위 요소에 적용해야 드래그 앤 드롭이 제대로 작동
          // ref={provided.innerRef}는 드롭 가능한 영역의 DOM 노드에 대한 참조를 설정하는 역할
          // 이 참조는 드래그 앤 드롭 라이브러리가 드롭 가능한 영역을 추적하고 관리하는 데 필요
          // 따라서 이 두 가지를 설정하지 않으면 드래그 앤 드롭 기능이 제대로 작동하지 않거나 경고가 발생
          // ref와 droppableProps를 설정하지 않으면 드래그 앤 드롭이 제대로 작동하지 않음
          // 예를 들어, 드래그한 아이템이 드롭 가능한 영역에 들어갔을 때 시각적 피드백이 없거나
          // 드롭 이벤트가 발생하지 않는 등의 문제가 발생할 수 있음
          // 따라서 드래그 앤 드롭 기능을 구현할 때는 반드시 이 두 가지를 설정해야 함
          // (이해가 잘 안되면 공식 문서 참고)
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
                  // provided: Draggable 컴포넌트가 자식 함수에 전달하는 객체로,
                  // 드래그 가능한 아이템을 설정하는 데 필요한 속성과 메서드를 포함

                  <li
                    className={styles.listItem}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    // style 속성은 라이브러리가 주는 것만 사용합니다.
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
