# Grunfeld

React 애플리케이션을 위한 **간단하고 직관적인 대화상자 관리 라이브러리**입니다.  
복잡한 상태 관리 없이 몇 줄의 코드로 모달, 알림, 확인 대화상자를 구현할 수 있습니다.

## ✨ 주요 특징

- 🚀 **간단한 API** - 복잡한 설정 없이 바로 사용 가능
- 🎯 **동기/비동기 지원** - 알림부터 사용자 입력까지 모든 시나리오 지원
- 📱 **유연한 위치 설정** - 9분할 그리드로 정확한 위치 배치
- 🔄 **스마트 스택 관리** - 논리적인 LIFO 순서로 대화상자 관리
- ⚡ **Top-layer 지원** - 네이티브 `<dialog>` 요소 활용
- 🎨 **완전한 커스터마이징** - 스타일과 동작 자유롭게 설정

## 📦 설치

```bash
npm install grunfeld
# 또는
yarn add grunfeld
```

## 🚀 빠른 시작

### 1. Provider 설정

앱의 최상위에 `GrunfeldProvider`를 추가하세요:

```tsx
import { GrunfeldProvider } from "grunfeld";

function App() {
  return <GrunfeldProvider>{/* 앱 내용 */}</GrunfeldProvider>;
}
```

### 2. 기본 사용법

```tsx
import { grunfeld } from "grunfeld";

function MyComponent() {
  const showAlert = () => {
    grunfeld.add(() => ({
      element: <div>안녕하세요!</div>,
    }));
  };

  return <button onClick={showAlert}>알림 표시</button>;
}
```

### 3. 사용자 응답 받기

```tsx
const showConfirm = async () => {
  const result = await grunfeld.add<boolean>((removeWith) => ({
    element: (
      <div>
        <p>정말 삭제하시겠습니까?</p>
        <button onClick={() => removeWith(true)}>확인</button>
        <button onClick={() => removeWith(false)}>취소</button>
      </div>
    ),
  }));

  if (result) {
    console.log("삭제 확인");
  }
};
```

## 📖 주요 사용 패턴

### 알림 대화상자

타입 매개변수를 생략하면 응답을 기다리지 않는 간단한 알림으로 사용됩니다:

```tsx
grunfeld.add((removeWith) => ({
  element: (
    <div>
      <p>저장이 완료되었습니다!</p>
      <button onClick={() => removeWith()}>확인</button>
    </div>
  ),
}));
```

### 확인 대화상자

사용자의 선택을 기다리는 확인 대화상자:

```tsx
const confirmed = await grunfeld.add<boolean>((removeWith) => ({
  element: (
    <div>
      <p>계속하시겠습니까?</p>
      <button onClick={() => removeWith(true)}>예</button>
      <button onClick={() => removeWith(false)}>아니오</button>
    </div>
  ),
}));
```

### 입력 대화상자

사용자로부터 데이터를 입력받는 대화상자:

```tsx
const userInput = await grunfeld.add<string>((removeWith) => ({
  element: (
    <div>
      <p>이름을 입력하세요:</p>
      <input onChange={(e) => removeWith(e.target.value)} placeholder="이름" />
    </div>
  ),
}));
```

### 비동기 처리

대화상자 생성 시 비동기 작업도 수행할 수 있습니다:

```tsx
const result = await grunfeld.add<string>(async (removeWith) => {
  const data = await fetch("/api/user").then((res) => res.json());

  return {
    element: (
      <div>
        <p>사용자: {data.name}</p>
        <input onChange={(e) => removeWith(e.target.value)} />
      </div>
    ),
  };
});
```

## ⚙️ 설정 옵션

### Provider 옵션

```tsx
<GrunfeldProvider
  options={{
    defaultPosition: "center",           // 기본 위치
    defaultLightDismiss: true,           // 배경 클릭으로 닫기
    defaultRenderMode: "inline",         // 렌더링 모드
    defaultBackdropStyle: {              // 기본 백드롭 스타일
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    }
  }}
>
```

### 개별 대화상자 옵션

```tsx
grunfeld.add(() => ({
  element: <MyDialog />,
  position: "top-right", // 위치 (9분할 그리드)
  lightDismiss: false, // 배경 클릭 비활성화
  renderMode: "top-layer", // top-layer 렌더링
  backdropStyle: {
    // 커스텀 백드롭
    backdropFilter: "blur(5px)",
  },
  dismissCallback: () => {
    // 닫힐 때 실행할 함수
    console.log("대화상자가 닫혔습니다");
  },
}));
```

## 📍 위치 시스템

화면을 9분할로 나누어 정확한 위치에 대화상자를 배치할 수 있습니다:

```
top-left     | top-center     | top-right
center-left  | center         | center-right
bottom-left  | bottom-center  | bottom-right
```

**사용 예시:**

```tsx
// 우상단 알림
grunfeld.add(() => ({
  element: <Notification />,
  position: "top-right",
}));

// 하단 액션 시트
grunfeld.add(() => ({
  element: <ActionSheet />,
  position: "bottom-center",
}));
```

## 🎨 렌더링 모드

### Inline 렌더링 (기본값)

- z-index 기반의 안정적인 방식
- 모든 브라우저 지원
- 커스터마이징 유연함

### Top-layer 렌더링

- 네이티브 `<dialog>` 요소 사용
- z-index 충돌 없음
- 자동 ESC 키 처리
- 최신 브라우저만 지원 (Chrome 37+, Firefox 98+, Safari 15.4+)

```tsx
grunfeld.add(() => ({
  element: <MyDialog />,
  renderMode: "top-layer", // 네이티브 dialog 사용
}));
```

## 🛠 대화상자 제거

```tsx
// 가장 최근 대화상자 제거
grunfeld.remove();

// 모든 대화상자 제거
grunfeld.clear();
```

대화상자는 LIFO(Last In First Out) 순서로 제거됩니다. 이는 대화상자들 간의 맥락적 관계를 유지하기 위함입니다.

## 📋 API 참조

### `grunfeld.add<T>(dialogFactory)`

**매개변수:**

- `dialogFactory`: 대화상자를 생성하는 함수
  - `(removeWith: (data: T) => void) => GrunfeldProps | Promise<GrunfeldProps>`

**반환값:**

- `T`가 `void`인 경우: `void`
- 그 외의 경우: `Promise<T>`

**GrunfeldProps:**

```typescript
{
  element: React.ReactNode;              // 표시할 내용
  position?: Position;                   // 위치 (기본: "center")
  lightDismiss?: boolean;                // 배경 클릭으로 닫기 (기본: true)
  backdropStyle?: React.CSSProperties;   // 백드롭 스타일
  dismissCallback?: () => unknown;       // 닫힐 때 실행할 함수
  renderMode?: "inline" | "top-layer";   // 렌더링 모드
}
```

### `grunfeld.remove()`

가장 최근 대화상자를 제거합니다.

### `grunfeld.clear()`

모든 대화상자를 제거합니다.

### Position 타입

```typescript
type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
```

## 🌐 브라우저 호환성

**Inline 렌더링:** 모든 모던 브라우저 + IE 11+  
**Top-layer 렌더링:** Chrome 37+, Firefox 98+, Safari 15.4+, Edge 79+

---

**Promise를 resolve하지 않으면 어떻게 될까요?**
사용자가 `removeWith`를 호출하지 않으면 Promise는 영원히 pending 상태가 되어 메모리 누수가 발생할 수 있습니다. 항상 적절한 종료 조건을 제공하거나 `grunfeld.remove()`/`grunfeld.clear()`로 수동 정리하세요.
