# Grunfeld

Grunfeld는 React 애플리케이션을 위한 **간단하고 가벼운 대화상자(dialog) 관리 라이브러리**입니다.
복잡한 상태 관리 없이 몇 줄의 코드로 모달, 알림, 확인 대화상자를 쉽게 구현할 수 있습니다.

## 특징

- 🚀 **간단한 API**: 복잡한 상태 관리 없이 몇 줄의 코드로 대화상자를 관리할 수 있습니다
- 🎯 **동기/비동기 지원**: 일반적인 알림부터 사용자 응답이 필요한 확인 대화상자까지 모든 시나리오를 지원합니다
- 📱 **유연한 위치 설정**: 9분할 그리드 시스템으로 화면의 어느 위치든 정확하게 배치 가능합니다
- 🔄 **스마트한 스택 관리**: 여러 대화상자가 열릴 때 논리적인 LIFO(Last In First Out) 순서로 관리됩니다
- 🎨 **커스텀 스타일링**: 백드롭 스타일부터 개별 대화상자 스타일까지 자유롭게 커스터마이징 가능합니다
- 👆 **직관적인 UX**: 배경 클릭으로 닫기, 자동 포커스 관리 등 사용자 경험을 고려한 기능들을 제공합니다
- ⚡ **Top-layer 지원**: 네이티브 HTML `<dialog>` 요소를 사용한 최상위 레이어 렌더링 지원

## 설치

```bash
npm install grunfeld
# 또는
yarn add grunfeld
```

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
        defaultLightDismiss: true,
        defaultRenderMode: "inline", // 또는 "top-layer"
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
    grunfeld.add(() => ({
      element: <div>안녕하세요!</div>,
      position: "center",
      lightDismiss: true,
      renderMode: "inline", // 기본 z-index 방식
    }));
  };

  const showTopLayerDialog = () => {
    grunfeld.add(() => ({
      element: <div>Top-layer 대화상자!</div>,
      position: "center",
      renderMode: "top-layer", // 네이티브 dialog 요소 사용
    }));
  };

  return (
    <div>
      <button onClick={showDialog}>일반 대화상자 열기</button>
      <button onClick={showTopLayerDialog}>Top-layer 대화상자 열기</button>
    </div>
  );
}
```

### 사용자 응답을 기다리는 대화상자

사용자의 선택이나 입력을 기다려야 할 때 사용합니다. Promise를 반환하므로 async/await 패턴으로 사용자의 응답을 처리할 수 있습니다:

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showConfirmDialog = async () => {
    const result = await grunfeld.add<boolean>((removeWith) => ({
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

### 비동기 처리가 포함된 대화상자

대화상자 내부에서 비동기 작업(API 호출 등)을 수행할 때도 사용할 수 있습니다:

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showAsyncDialog = async () => {
    const result = await grunfeld.add<string>(async (removeWith) => {
      // 비동기 작업 수행 (예: 데이터 로딩)
      const data = await fetch("/api/user").then((res) => res.json());

      return {
        element: (
          <div>
            <p>사용자 이름: {data.name}</p>
            <input
              type="text"
              placeholder="메시지를 입력하세요"
              onChange={(e) => {
                if (e.target.value) {
                  removeWith(e.target.value);
                }
              }}
            />
          </div>
        ),
        position: "center",
      };
    });

    console.log("사용자가 입력한 메시지:", result);
  };

  return <button onClick={showAsyncDialog}>비동기 대화상자</button>;
}
```

### 간단한 사용법 (void 타입)

사용자 응답이 필요 없는 간단한 알림이나 정보 표시용 대화상자의 경우 타입 매개변수를 생략할 수 있습니다:

```tsx
import { grunfeld } from "grunfeld";

function YourComponent() {
  const showSimpleAlert = () => {
    // 타입 매개변수를 생략하면 void로 처리됩니다
    grunfeld.add((removeWith) => ({
      element: (
        <div>
          <p>저장이 완료되었습니다!</p>
          <button onClick={() => removeWith()}>확인</button>
        </div>
      ),
      position: "center",
    }));
  };

  return <button onClick={showSimpleAlert}>알림 표시</button>;
}
```

### 대화상자 제거

Grunfeld는 대화상자들을 스택(Stack) 구조로 관리합니다. 이는 대화상자들 간의 **맥락적 관계**를 유지하기 위함입니다.

예를 들어, A 대화상자에서 B 대화상자를 열었다면, A의 결과로 B가 생성된 것이므로 B가 먼저 닫혀야 논리적으로 올바릅니다. 이러한 원칙에 따라 `remove()`는 항상 가장 최근에 열린 대화상자부터 제거합니다.

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

| 속성                | 타입                    | 기본값   | 설명                    |
| ------------------- | ----------------------- | -------- | ----------------------- |
| defaultPosition     | Position                | 'center' | 대화상자의 기본 위치    |
| defaultLightDismiss | boolean                 | true     | 기본 light dismiss 설정 |
| defaultRenderMode   | 'inline' \| 'top-layer' | 'inline' | 기본 렌더링 모드        |
| backdropStyle       | CSSProperties           | -        | 백드롭 커스텀 스타일    |

#### Position 타입

Grunfeld는 화면을 9분할한 그리드 시스템을 사용하여 대화상자를 정확한 위치에 배치할 수 있습니다:

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

**위치별 설명:**

| 위치            | 설명                 | 사용 사례               |
| --------------- | -------------------- | ----------------------- |
| `top-left`      | 왼쪽 상단 모서리     | 알림, 미니 메뉴         |
| `top-center`    | 상단 중앙            | 헤더 알림, 상단 배너    |
| `top-right`     | 오른쪽 상단 모서리   | 사용자 메뉴, 알림       |
| `center-left`   | 왼쪽 세로 중앙       | 사이드 패널, 네비게이션 |
| `center`        | 완전한 중앙 (기본값) | 모달, 확인 대화상자     |
| `center-right`  | 오른쪽 세로 중앙     | 도구 모음, 설정 패널    |
| `bottom-left`   | 왼쪽 하단 모서리     | 상태 표시기             |
| `bottom-center` | 하단 중앙            | 바텀 시트, 액션 시트    |
| `bottom-right`  | 오른쪽 하단 모서리   | 플로팅 액션 버튼, 채팅  |

### grunfeld 객체

#### `grunfeld.add<T = void>(dialogFactory)`

새로운 대화상자를 추가합니다. 기존의 `add`와 `addAsync` 기능이 통합된 메서드입니다.

**매개변수:**

- `dialogFactory: (removeWith: (data: T) => T) => GrunfeldProps | Promise<GrunfeldProps>` - 대화상자 팩토리 함수

**반환값:**

- `T extends void ? void : Promise<T>` - `T`가 `void`인 경우 아무것도 반환하지 않고, 그렇지 않으면 `Promise<T>`를 반환

**사용 예시:**

```typescript
// void 타입 (응답 불필요)
grunfeld.add((removeWith) => ({
  element: <div>알림</div>,
}));

// 특정 타입 응답 대기
const result = await grunfeld.add<string>((removeWith) => ({
  element: <input onChange={(e) => removeWith(e.target.value)} />,
}));

// 비동기 처리
const result = await grunfeld.add<UserData>(async (removeWith) => {
  const userData = await fetchUserData();
  return {
    element: <UserProfile data={userData} onSave={removeWith} />,
  };
});
```

**GrunfeldProps:**

```typescript
type GrunfeldProps = {
  element: React.ReactNode;
  position?: Position; // 9분할 그리드 위치
  lightDismiss?: boolean;
  dismissCallback?: () => unknown;
  renderMode?: "inline" | "top-layer";
};
```

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
grunfeld.add(() => ({
  element: <MyDialog />,
  dismissCallback: () => {
    console.log("대화상자가 닫혔습니다");
    // 정리 작업 수행
  },
}));
```

### 위치별 대화상자

Grunfeld의 9분할 그리드 시스템을 사용하여 다양한 UI 패턴에 맞춰 대화상자를 정확한 위치에 배치할 수 있습니다:

```tsx
// 중앙 모달 (기본값)
grunfeld.add(() => ({
  element: <CenterDialog />,
  position: "center",
}));

// 바텀 시트
grunfeld.add(() => ({
  element: <BottomSheet />,
  position: "bottom-center",
}));

// 상단 알림
grunfeld.add(() => ({
  element: <Notification />,
  position: "top-right",
}));

// 사이드 패널
grunfeld.add(() => ({
  element: <SidePanel />,
  position: "center-left",
}));

// 플로팅 액션 버튼 메뉴
grunfeld.add(() => ({
  element: <FABMenu />,
  position: "bottom-right",
}));

// 툴팁이나 컨텍스트 메뉴
grunfeld.add(() => ({
  element: <ContextMenu />,
  position: "top-left",
}));
```

### Top-layer vs Inline 렌더링

Grunfeld는 두 가지 렌더링 방식을 제공합니다:

#### Inline 렌더링 (기본값)

기존의 z-index 기반 방식으로, 모든 브라우저에서 안정적으로 동작합니다:

```tsx
grunfeld.add(() => ({
  element: <MyDialog />,
  renderMode: "inline", // z-index 사용
}));
```

**특징:**

- ✅ 모든 브라우저 호환
- ✅ 안정적인 동작
- ✅ 커스텀 스타일링 유연함
- ⚠️ z-index 충돌 가능성

#### Top-layer 렌더링

HTML 네이티브 `<dialog>` 요소를 사용하여 최상위 레이어에 렌더링합니다:

```tsx
grunfeld.add(() => ({
  element: <MyDialog />,
  renderMode: "top-layer", // 네이티브 dialog 사용
}));
```

**특징:**

- ✅ z-index 충돌 없음
- ✅ 브라우저 네이티브 성능
- ✅ 자동 접근성 관리
- ✅ 자동 ESC 키 처리
- ⚠️ 최신 브라우저만 지원

### 렌더링 모드 선택 가이드

상황에 따라 적절한 렌더링 모드를 선택하세요:

| 상황                     | 권장 모드   | 이유                     |
| ------------------------ | ----------- | ------------------------ |
| 일반적인 모달            | `inline`    | 안정적이고 호환성 좋음   |
| z-index 충돌이 있는 환경 | `top-layer` | 최상위 레이어 보장       |
| 고성능이 필요한 경우     | `top-layer` | 브라우저 네이티브 최적화 |
| 레거시 브라우저 지원     | `inline`    | 광범위한 호환성          |

## 브라우저 호환성

### Inline 렌더링 (기본값)

- ✅ **모든 모던 브라우저** 지원
- ✅ IE 11+ 지원 (React 지원 범위와 동일)

### Top-layer 렌더링

- ✅ **Chrome 37+**
- ✅ **Firefox 98+**
- ✅ **Safari 15.4+**
- ✅ **Edge 79+**

> **참고**: Top-layer 지원 여부는 런타임에 `'HTMLDialogElement' in window`로 확인할 수 있습니다.
