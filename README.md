# Grunfeld

## 특징

- 🚀 **간단한 API**: 복잡한 상태 관리 없이 몇 줄의 코드로 대화상자를 관리할 수 있습니다
- 🎯 **동기/비동기 지원**: 일반적인 알림부터 사용자 응답이 필요한 확인 대화상자까지 모든 시나리오를 지원합니다
- 📱 **유연한 위치 설정**: 중앙 모달, 하단 시트 등 다양한 UI 패턴에 맞춰 위치를 조정할 수 있습니다
- 🔄 **스마트한 스택 관리**: 여러 대화상자가 열릴 때 논리적인 LIFO(Last In First Out) 순서로 관리됩니다
- 🎨 **커스텀 스타일링**: 백드롭 스타일부터 개별 대화상자 스타일까지 자유롭게 커스터마이징 가능합니다
- 👆 **직관적인 UX**: 배경 클릭으로 닫기, 자동 포커스 관리 등 사용자 경험을 고려한 기능들을 제공합니다는 React 애플리케이션을 위한 간단하고 가벼운 대화상자(dialog) 관리 라이브러리입니다.

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

애플리케이션의 최상위 레벨에 `GrunfeldProvider`를 추가하세요. 이 컴포넌트는 모든 대화상자를 렌더링하고 관리하는 컨텍스트를 제공합니다:

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

가장 기본적인 형태의 대화상자입니다. 사용자에게 정보를 보여주거나 간단한 상호작용이 필요할 때 사용합니다:

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

사용자의 선택이나 입력을 기다려야 할 때 사용합니다. Promise를 반환하므로 async/await 패턴으로 사용자의 응답을 처리할 수 있습니다:

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

복잡한 설정 없이 JSX 요소나 문자열을 직접 전달하여 빠르게 대화상자를 표시할 수 있습니다:

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

Grunfeld는 대화상자들을 스택(Stack) 구조로 관리합니다. 이는 대화상자들 간의 **맥락적 관계**를 유지하기 위함입니다.

예를 들어, A 대화상자에서 B 대화상자를 열었다면, B가 A의 결과로 생성된 것이므로 B가 먼저 닫혀야 논리적으로 올바릅니다. 이러한 원칙에 따라 `remove()`는 항상 가장 최근에 열린 대화상자부터 제거합니다.

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

이 메서드는 **LIFO(Last In First Out)** 원칙을 따릅니다. 여러 대화상자가 열려있을 때, 가장 마지막에 열린 대화상자부터 순서대로 닫힙니다. 이는 대화상자들 간의 맥락적 관계를 유지하기 위한 설계입니다.

```tsx
// 예시: A → B → C 순서로 열린 경우
grunfeld.remove(); // C가 닫힘
grunfeld.remove(); // B가 닫힘
grunfeld.remove(); // A가 닫힘
```

#### `grunfeld.clear()`

모든 대화상자를 한 번에 제거합니다.

긴급한 상황이나 페이지 전환 시 모든 대화상자를 정리해야 할 때 사용합니다. 각 대화상자의 `dismissCallback`이 있다면 모두 실행된 후 제거됩니다.

## 고급 사용법

### 커스텀 dismiss 콜백

대화상자가 닫힐 때 특정 로직을 실행해야 하는 경우 `dismissCallback`을 사용합니다. 이는 정리 작업, 상태 업데이트, 분석 이벤트 전송 등에 유용합니다:

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

다양한 UI 패턴에 맞춰 대화상자의 위치를 조정할 수 있습니다. 각 위치는 서로 다른 사용자 경험을 제공합니다:

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
