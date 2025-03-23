# Grunfeld

Grunfeld는 React 애플리케이션을 위한 간단하고 가벼운 대화상자(dialog) 관리 라이브러리입니다.

## 설치

```bash
npm install grunfeld
# 또는
yarn add grunfeld
```

## 특징

- 🚀 간단한 API로 대화상자 관리
- 🎨 CSS 모듈을 통한 스타일링
- 📱 위치 설정 가능 ('center' 또는 'bottom')
- 🔄 다중 대화상자 스택 지원

## 사용법

### 기본 설정

애플리케이션의 최상위 레벨에 `GrunfeldProvider`를 추가하세요:

```jsx
import { GrunfeldProvider } from 'grunfeld';

function App() {
  return (
    <GrunfeldProvider>
      {/* 애플리케이션 내용 */}
    </GrunfeldProvider>
  );
}
```

### 대화상자 표시하기

```jsx
import { addDialog } from 'grunfeld';

function YourComponent() {
  const showDialog = () => {
    addDialog({
      element: <YourDialogContent />,
      position: 'center' // 또는 'bottom'
    });
  };

  return <button onClick={showDialog}>대화상자 열기</button>;
}
```

### 대화상자 닫기

```jsx
import { removeDialog } from 'grunfeld';

function DialogContent() {
  return (
    <div>
      <h2>대화상자 내용</h2>
      <button onClick={removeDialog}>닫기</button>
    </div>
  );
}
```

### 모든 대화상자 제거

```jsx
import { clearStore } from 'grunfeld';

// 모든 대화상자 제거
clearStore();
```

## API 참조

### GrunfeldProvider

| 속성 | 타입 | 기본값 | 설명 |
|------|------|-------|------|
| children | ReactNode | 필수 | 자식 컴포넌트 |
| defaultPosition | 'center' \| 'bottom' | 'center' | 대화상자의 기본 위치 |

### 함수

| 함수 | 매개변수 | 설명 |
|------|---------|------|
| addDialog | { element: ReactNode, position?: Position } | 새 대화상자 추가 |
| removeDialog | 없음 | 가장 최근에 추가된 대화상자 제거 |
| clearStore | 없음 | 모든 대화상자 제거 |
