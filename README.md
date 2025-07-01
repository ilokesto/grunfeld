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
- � 동기/비동기 대화상자 지원
- 📱 위치 설정 가능 ('center' 또는 'bottom')
- 🔄 다중 대화상자 스택 지원
- 🎨 커스텀 스타일링 지원
- 👆 Light dismiss (배경 클릭으로 닫기) 옵션

## 사용법

### 기본 설정

애플리케이션의 최상위 레벨에 `GrunfeldProvider`를 추가하세요:

```tsx
import { GrunfeldProvider } from "grunfeld";

function App() {
  return (
    <GrunfeldProvider
      options={{
        defaultPosition: "center",
        defaultDismiss: true,
        backdropStyle: {
          /* 커스텀 백드롭 스타일 */
        },
      }}
    >
      {/* 애플리케이션 내용 */}
    </GrunfeldProvider>
  );
}
```

### 기본 대화상자 표시

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showDialog = () => {
    grunfeld.add({
      element: <div>안녕하세요!</div>,
      position: "center",
      lightDismiss: true,
    });
  };

  return <button onClick={showDialog}>대화상자 열기</button>;
}
```

### 비동기 대화상자 (사용자 응답 대기)

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showConfirmDialog = async () => {
    const result = await grunfeld.addAsync((removeWith) => ({
      element: (
        <div>
          <p>정말 삭제하시겠습니까?</p>
          <button onClick={() => removeWith(true)}>확인</button>
          <button onClick={() => removeWith(false)}>취소</button>
        </div>
      ),
      position: "center",
    }));

    if (result) {
      console.log("사용자가 확인을 클릭했습니다");
    } else {
      console.log("사용자가 취소를 클릭했습니다");
    }
  };

  return <button onClick={showConfirmDialog}>확인 대화상자</button>;
}
```

### 간단한 대화상자 (ReactNode만 전달)

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showSimpleDialog = () => {
    // ReactNode를 직접 전달할 수 있습니다
    grunfeld.add(<div>간단한 메시지</div>);
  };

  return <button onClick={showSimpleDialog}>간단한 대화상자</button>;
}
```

### 대화상자 제거

```tsx
import { grunfeld } from "grunfeld";

// 가장 최근 대화상자 제거
grunfeld.remove();

// 모든 대화상자 제거
grunfeld.clear();
```

## API 참조

### GrunfeldProvider

| 속성     | 타입                    | 기본값 | 설명           |
| -------- | ----------------------- | ------ | -------------- |
| children | ReactNode               | 필수   | 자식 컴포넌트  |
| options  | GrunfeldProviderOptions | -      | 기본 설정 옵션 |

#### GrunfeldProviderOptions

| 속성            | 타입                 | 기본값   | 설명                    |
| --------------- | -------------------- | -------- | ----------------------- |
| defaultPosition | 'center' \| 'bottom' | 'center' | 대화상자의 기본 위치    |
| defaultDismiss  | boolean              | true     | 기본 light dismiss 설정 |
| backdropStyle   | CSSProperties        | -        | 백드롭 커스텀 스타일    |

### grunfeld 객체

#### `grunfeld.add(dialog)`

새로운 대화상자를 추가합니다.

**매개변수:**

- `dialog: GrunfeldProps` - 대화상자 설정

**GrunfeldProps:**

```typescript
type GrunfeldProps =
  | {
      element: React.ReactNode;
      position?: "center" | "bottom";
      lightDismiss?: boolean;
      dismissCallback?: () => unknown;
    }
  | React.ReactNode;
```

#### `grunfeld.addAsync<T>(dialog)`

비동기 대화상자를 추가하고 사용자 응답을 기다립니다.

**매개변수:**

- `dialog: (removeWith: (data: T) => T) => GrunfeldProps` - 대화상자 팩토리 함수

**반환값:**

- `Promise<T>` - 사용자가 `removeWith`를 호출할 때 전달한 데이터

#### `grunfeld.remove()`

가장 최근에 추가된 대화상자를 제거합니다.

#### `grunfeld.clear()`

모든 대화상자를 제거합니다.

## 고급 사용법

### 커스텀 dismiss 콜백

```tsx
grunfeld.add({
  element: <MyDialog />,
  dismissCallback: () => {
    console.log("대화상자가 닫혔습니다");
    // 정리 작업 수행
  },
});
```

### 위치별 대화상자

```tsx
// 중앙에 표시
grunfeld.add({
  element: <CenterDialog />,
  position: "center",
});

// 하단에 표시 (바텀 시트 스타일)
grunfeld.add({
  element: <BottomSheet />,
  position: "bottom",
});
```
