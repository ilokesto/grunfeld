# Grunfeld

Grunfeld는 React 애플리케이션을 위한 **간단하고 직관적인 대화상자 관리 라이브러리**입니다. 복잡한 상태 관리 없이 몇 줄의 코드로 모달, 알림, 확인 대화상자를 구현할 수 있습니다.

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
    // 간단한 사용 - React 요소 직접 반환
    grunfeld.add(() => <div>안녕하세요!</div>);
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
    console.log("사용자가 확인을 클릭했습니다");
  } else {
    console.log("사용자가 취소를 클릭했습니다");
  }
};
```

## 📖 주요 사용 패턴

### 알림 대화상자

타입 매개변수를 생략하면 응답을 기다리지 않는 간단한 알림으로 사용됩니다:

```tsx
// 기본 알림 - React 요소 직접 반환
grunfeld.add(() => (
  <div
    style={{
      padding: "20px",
      background: "white",
      borderRadius: "8px",
      textAlign: "center",
    }}
  >
    <p>저장이 완료되었습니다!</p>
    <button onClick={() => grunfeld.remove()}>확인</button>
  </div>
));
```

### 확인 대화상자

사용자의 선택을 기다리는 확인 대화상자:

```tsx
const confirmed = await grunfeld.add<boolean>((removeWith) => ({
  element: (
    <div
      style={{
        padding: "20px",
        background: "white",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <p>정말 삭제하시겠습니까?</p>
      <div>
        <button onClick={() => removeWith(true)}>삭제</button>
        <button onClick={() => removeWith(false)}>취소</button>
      </div>
    </div>
  ),
}));

if (confirmed) {
  console.log("사용자가 삭제를 확인했습니다");
  // 삭제 로직 실행
} else {
  console.log("사용자가 취소했습니다");
}
```

### 입력 대화상자

사용자로부터 데이터를 입력받는 대화상자:

```tsx
const InputModal = ({ onClose }: { onClose: (name: string) => void }) => {
  const [name, setName] = useState("");

  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        borderRadius: "8px",
        minWidth: "300px",
      }}
    >
      <h2>이름을 입력하세요</h2>
      <input
        autoFocus
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && name.trim() && onClose(name.trim())
        }
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <div>
        <button
          onClick={() => name.trim() && onClose(name.trim())}
          disabled={!name.trim()}
          style={{ marginRight: "10px" }}
        >
          확인
        </button>
        <button onClick={() => onClose("")}>취소</button>
      </div>
    </div>
  );
};

export default function GrunfeldPage() {
  return (
    <button
      onClick={async () => {
        const value = await grunfeld.add<string>((removeWith) => ({
          element: <InputModal onClose={removeWith} />,
        }));
        console.log(value);
      }}
    >
      테스트 버튼
    </button>
  );
}
```

### 비동기 처리

대화상자 생성 시 비동기 작업도 수행할 수 있습니다:

```tsx
const result = await grunfeld.add<string>(async (removeWith) => {
  // 로딩 표시
  const loadingElement = (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>사용자 정보를 불러오는 중...</p>
      <div>⏳</div>
    </div>
  );

  // 먼저 로딩 다이얼로그 표시
  setTimeout(() => {
    // 실제 데이터 로드 후 내용 업데이트
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        // 성공적으로 로드된 후의 UI로 업데이트하려면
        // 새로운 다이얼로그를 생성하거나 상태 관리를 사용해야 합니다
      })
      .catch(() => {
        removeWith("로드 실패");
      });
  }, 100);

  return {
    element: loadingElement,
  };
});

// 더 실용적인 예제: 선택 리스트
const selectedItem = await grunfeld.add<string>(async (removeWith) => {
  const items = await fetch("/api/items").then((res) => res.json());

  return {
    element: (
      <div style={{ padding: "20px", minWidth: "250px" }}>
        <h3>항목을 선택하세요</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item: any) => (
            <li key={item.id}>
              <button
                onClick={() => removeWith(item.name)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "4px",
                  textAlign: "left",
                }}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => removeWith("")}>취소</button>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(5px)",
  },
  dismissCallback: () => {
    // 닫힐 때 실행할 함수
    console.log("대화상자가 닫혔습니다");
  },
}));

// 스타일링 예제
grunfeld.add(() => ({
  element: (
    <>
      <h2>🎉 축하합니다!</h2>
      <p>작업이 성공적으로 완료되었습니다.</p>
      <button onClick={() => grunfeld.remove()}>확인</button>
    </>
  ),
  position: "center",
  backdropStyle: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    backdropFilter: "blur(8px)",
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

> **참고:** 중앙 위치는 `center` 또는 `center-center` 모두 사용 가능합니다.

**사용 예시:**

```tsx
// 중앙 배치 - 두 방식 모두 동일하게 작동
grunfeld.add(() => ({
  element: <Modal />,
  position: "center", // 또는 "center-center"
}));

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
- JavaScript 기반 ESC 키 처리

### Top-layer 렌더링

- 네이티브 `<dialog>` 요소 사용
- z-index 충돌 없음
- 브라우저 네이티브 ESC 키 처리
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

// ESC 키로 닫기
// 또는 lightDismiss: true일 때 배경 클릭으로 닫기
```

대화상자는 LIFO(Last In First Out) 순서로 제거됩니다. 이는 대화상자들 간의 맥락적 관계를 유지하기 위함입니다.

### Promise 중단 처리

`grunfeld.remove()` 또는 `grunfeld.clear()`를 호출하여 대화상자를 강제로 닫으면, 해당 대화상자의 Promise는 `undefined`로 resolve됩니다:

```tsx
// Promise가 진행 중일 때 외부에서 제거하는 경우
const promise = grunfeld.add<boolean>((removeWith) => ({
  element: (
    <div>
      <p>확인하시겠습니까?</p>
      <button onClick={() => removeWith(true)}>예</button>
      <button onClick={() => removeWith(false)}>아니오</button>
    </div>
  ),
}));

// 다른 곳에서 대화상자를 강제로 제거
setTimeout(() => {
  grunfeld.remove(); // promise는 undefined로 resolve됨
}, 1000);

const result = await promise; // result는 undefined
if (result === undefined) {
  console.log("대화상자가 중단되었습니다");
} else if (result) {
  console.log("사용자가 예를 선택했습니다");
} else {
  console.log("사용자가 아니오를 선택했습니다");
}
```

**실용적인 예제:**

```tsx
const showConfirmWithTimeout = async () => {
  const confirmPromise = grunfeld.add<boolean>((removeWith) => ({
    element: (
      <div>
        <p>10초 안에 응답해주세요. 확인하시겠습니까?</p>
        <button onClick={() => removeWith(true)}>확인</button>
        <button onClick={() => removeWith(false)}>취소</button>
      </div>
    ),
  }));

  // 10초 후 자동으로 제거
  const timeoutId = setTimeout(() => {
    grunfeld.remove(); // Promise는 undefined로 resolve됨
  }, 10000);

  const result = await confirmPromise;
  clearTimeout(timeoutId); // 사용자가 응답한 경우 타이머 제거

  if (result === undefined) {
    console.log("시간 초과로 대화상자가 닫혔습니다");
  } else if (result) {
    console.log("사용자가 확인을 선택했습니다");
  } else {
    console.log("사용자가 취소를 선택했습니다");
  }
};
```

이 동작은 메모리 누수를 방지하고 hanging Promise 문제를 해결합니다. 모든 Promise는 적절히 정리되므로 안전하게 사용할 수 있습니다.

## 🎯 실제 사용 예제

### 완전한 컴포넌트 예제

```tsx
import React, { useState } from "react";
import { grunfeld, GrunfeldProvider } from "grunfeld";

function MyApp() {
  const [message, setMessage] = useState("");

  const showNotification = () => {
    grunfeld.add(() => ({
      element: <div>알림이 표시되었습니다!</div>,
      position: "top-right",
    }));

    // 2초 후 자동으로 제거
    setTimeout(() => grunfeld.remove(), 2000);
  };

  const showConfirm = async () => {
    const result = await grunfeld.add<boolean>((removeWith) => ({
      element: (
        <div
          style={{ padding: "20px", background: "white", borderRadius: "8px" }}
        >
          <h3>확인</h3>
          <p>정말 진행하시겠습니까?</p>
          <button onClick={() => removeWith(true)}>예</button>
          <button onClick={() => removeWith(false)}>아니오</button>
        </div>
      ),
    }));

    setMessage(result ? "확인됨" : "취소됨");
  };

  const showInput = async () => {
    const input = await grunfeld.add<string>((removeWith) => ({
      element: <InputDialog onSubmit={removeWith} />,
    }));

    setMessage(input ? `입력값: ${input}` : "취소됨");
  };

  return (
    <GrunfeldProvider>
      <div style={{ padding: "20px" }}>
        <h1>Grunfeld 예제</h1>
        <button onClick={showNotification}>알림 표시</button>
        <button onClick={showConfirm}>확인 대화상자</button>
        <button onClick={showInput}>입력 대화상자</button>
        <p>상태: {message}</p>
      </div>
    </GrunfeldProvider>
  );
}

const InputDialog = ({ onSubmit }: { onSubmit: (value: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "8px" }}>
      <h3>입력</h3>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="값을 입력하세요"
        autoFocus
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => onSubmit(value)}>확인</button>
        <button onClick={() => onSubmit("")}>취소</button>
      </div>
    </div>
  );
};
```

## 📋 API 참조

### `grunfeld.add<T>(dialogFactory)`

**매개변수:**

- `dialogFactory`: 대화상자를 생성하는 함수
  - `(removeWith: (data: T) => void) => GrunfeldProps | Promise<GrunfeldProps>`
  - `GrunfeldProps`는 다음 중 하나:
    - React 요소 직접 반환: `React.ReactNode`
    - 옵션이 포함된 객체: `{ element: React.ReactNode; position?: Position; ... }`

**반환값:**

- 항상 `Promise<T>` 반환 (내부적으로 TypeScript 조건부 타입 처리)

**사용 예시:**

```tsx
// 1. 간단한 사용법 - React 요소 직접 반환
grunfeld.add(() => <div>간단한 알림</div>);

// 2. 옵션과 함께 사용 - 객체 반환
grunfeld.add(() => ({
  element: <div>위치가 지정된 알림</div>,
  position: "top-right",
  lightDismiss: false,
}));

// 3. 사용자 응답 받기
const result = await grunfeld.add<boolean>((removeWith) => ({
  element: (
    <div>
      <p>확인하시겠습니까?</p>
      <button onClick={() => removeWith(true)}>예</button>
      <button onClick={() => removeWith(false)}>아니오</button>
    </div>
  ),
}));
```

**GrunfeldProps:**

```typescript
{
  element: React.ReactNode;              // 표시할 내용
  position?: Position;                   // 위치 (기본: "center")
  lightDismiss?: boolean;                // 배경 클릭으로 닫기 (기본: true)
  backdropStyle?: React.CSSProperties;   // 백드롭 스타일
  dismissCallback?: () => unknown;       // 닫힐 때 실행할 함수 (주의: 여기서 grunfeld.remove() 호출 금지)
  renderMode?: "inline" | "top-layer";   // 렌더링 모드
}
```

**⚠️ 중요:** `dismissCallback`은 대화상자가 제거될 때 실행되므로, 이 함수 내에서 `grunfeld.remove()`나 `grunfeld.clear()`를 호출하면 안 됩니다. 자동으로 사라지는 알림을 만들려면 `setTimeout`을 대화상자 생성 후에 별도로 실행하세요:

```tsx
// ❌ 잘못된 방법
grunfeld.add(() => ({
  element: <div>알림</div>,
  dismissCallback: () => {
    setTimeout(() => grunfeld.remove(), 2000); // 무한 루프 위험
  },
}));

// ✅ 올바른 방법
grunfeld.add(() => ({
  element: <div>알림</div>,
}));
setTimeout(() => grunfeld.remove(), 2000);
```

### `grunfeld.remove()`

가장 최근 대화상자를 제거합니다.

### `grunfeld.clear()`

모든 대화상자를 제거합니다.

### Position 타입

```typescript
type PositionX = "left" | "center" | "right";
type PositionY = "top" | "center" | "bottom";

type Position = `${PositionY}-${PositionX}` | "center";
```

## 🌐 브라우저 호환성

**Inline 렌더링:** 모든 모던 브라우저 + IE 11+
**Top-layer 렌더링:** Chrome 37+, Firefox 98+, Safari 15.4+, Edge 79+
