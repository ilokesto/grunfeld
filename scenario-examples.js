// 시나리오 기능 사용 예시

import { grunfeld } from "./src/index";

// 로그인 시나리오 예시 (매개변수 지원)
const loginScenario = grunfeld.scenario("login", {
  step1: ({ userName }) => {
    grunfeld.add(() => ({
      element: `${userName || "사용자"}님, Login Modal을 표시합니다`,
      position: "center",
    }));
  },

  step2: async ({ isQuickLogin = false }) => {
    grunfeld.remove(); // 이전 모달 제거

    if (isQuickLogin) {
      // 빠른 로그인 모드
      grunfeld.add(() => ({
        element: "빠른 로그인 중...",
        position: "center",
      }));
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      // 일반 로그인 모드 - 사용자 확인 필요
      const userConfirmed = await grunfeld.add((removeWith) => ({
        element: (
          <div>
            <p>Loading... 인증 중입니다</p>
            <button onClick={() => removeWith(true)}>계속</button>
            <button onClick={() => removeWith(false)}>취소</button>
          </div>
        ),
        position: "center",
      }));

      if (!userConfirmed) {
        throw new Error("사용자가 로그인을 취소했습니다");
      }
    }
  },

  step3: ({ userName, welcomeMessage }) => {
    grunfeld.remove(); // 로딩 모달 제거
    grunfeld.add(() => ({
      element:
        welcomeMessage || `${userName || "사용자"}님, 로그인 성공! 환영합니다`,
      position: "top-right",
    }));

    // 3초 후 자동으로 닫기
    setTimeout(() => grunfeld.remove(), 3000);
  },
});

// 결제 시나리오 예시
const paymentScenario = grunfeld.scenario("payment", {
  showCart: () => {
    grunfeld.add(() => ({
      element: "장바구니 내용을 확인하세요",
      position: "center",
    }));
  },

  selectPayment: () => {
    grunfeld.remove();
    grunfeld.add(() => ({
      element: "결제 수단을 선택하세요",
      position: "center",
    }));
  },

  processPayment: async () => {
    grunfeld.remove();
    grunfeld.add(() => ({
      element: "결제를 처리 중입니다...",
      position: "center",
    }));

    // 결제 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));
  },

  showSuccess: () => {
    grunfeld.remove();
    grunfeld.add(() => ({
      element: "결제가 완료되었습니다!",
      position: "center",
    }));
  },
});

// 시나리오 간 데이터 공유 예시
const dataFlowScenario = grunfeld.scenario("data-flow", {
  collectUserData: async () => {
    // 1단계: 이름 입력
    const name =
      (await grunfeld.add) <
      string >
      ((removeWith) => ({
        element: (
          <div>
            <h3>이름을 입력하세요</h3>
            <input
              type="text"
              placeholder="이름"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  removeWith(e.target.value || "익명");
                }
              }}
            />
          </div>
        ),
        position: "center",
      }));

    // 2단계: 이메일 입력
    grunfeld.remove();
    const email =
      (await grunfeld.add) <
      string >
      ((removeWith) => ({
        element: (
          <div>
            <h3>이메일을 입력하세요</h3>
            <input
              type="email"
              placeholder="email@example.com"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  removeWith(e.target.value || "no-email@example.com");
                }
              }}
            />
          </div>
        ),
        position: "center",
      }));

    // 수집된 데이터를 다음 단계에서 사용할 수 있도록 저장
    dataFlowScenario._userData = { name, email };
    return { name, email };
  },

  confirmData: async () => {
    const userData = dataFlowScenario._userData;
    grunfeld.remove();

    const confirmed =
      (await grunfeld.add) <
      boolean >
      ((removeWith) => ({
        element: (
          <div>
            <h3>입력한 정보가 맞습니까?</h3>
            <p>이름: {userData.name}</p>
            <p>이메일: {userData.email}</p>
            <button onClick={() => removeWith(true)}>확인</button>
            <button onClick={() => removeWith(false)}>수정</button>
          </div>
        ),
        position: "center",
      }));

    if (!confirmed) {
      // 다시 데이터 수집 단계로
      await dataFlowScenario.step("collectUserData");
      await dataFlowScenario.step("confirmData");
    }
  },
});

// 사용법 예시들

// 1. 특정 단계만 실행 (매개변수와 함께)
async function handleLogin() {
  await loginScenario.step("step1", { userName: "홍길동" });
  // 사용자 입력 기다림...
  await loginScenario.step("step2", { isQuickLogin: false });
  // API 호출 완료 후...
  await loginScenario.step("step3", {
    userName: "홍길동",
    welcomeMessage: "특별한 환영 메시지!",
  });
}

// 2. 전체 시나리오 실행 (각 단계별 매개변수 전달)
async function handleQuickLogin() {
  try {
    await loginScenario.run({
      step1: { userName: "김철수" },
      step2: { isQuickLogin: true },
      step3: { userName: "김철수", welcomeMessage: "빠른 로그인 완료!" },
    });
  } catch (error) {
    console.error("로그인 시나리오 실행 중 오류:", error);
  }
}

// 3. 매개변수 없이 실행 (기존 방식도 계속 지원)
async function handleBasicLogin() {
  try {
    await loginScenario.run(); // 매개변수 없이도 작동
  } catch (error) {
    console.error("기본 로그인 실행 중 오류:", error);
  }
}

// 사용자 입력을 받는 시나리오 예시
const userRegistrationScenario = grunfeld.scenario("user-registration", {
  welcomeStep: () => {
    grunfeld.add(() => ({
      element: "회원가입을 시작합니다",
      position: "center",
    }));
  },

  getUserName: async () => {
    grunfeld.remove();
    const userName =
      (await grunfeld.add) <
      string >
      ((removeWith) => ({
        element: (
          <div>
            <h3>이름을 입력하세요</h3>
            <input
              type="text"
              placeholder="이름"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  removeWith(e.target.value);
                }
              }}
            />
            <button onClick={() => removeWith("기본 사용자")}>확인</button>
          </div>
        ),
        position: "center",
      }));

    console.log("입력받은 이름:", userName);
    return userName;
  },

  confirmRegistration: async () => {
    const confirmed =
      (await grunfeld.add) <
      boolean >
      ((removeWith) => ({
        element: (
          <div>
            <h3>회원가입을 완료하시겠습니까?</h3>
            <button onClick={() => removeWith(true)}>예</button>
            <button onClick={() => removeWith(false)}>아니오</button>
          </div>
        ),
        position: "center",
      }));

    if (!confirmed) {
      throw new Error("회원가입이 취소되었습니다");
    }
  },

  showSuccess: () => {
    grunfeld.add(() => ({
      element: "회원가입이 완료되었습니다!",
      position: "top-right",
    }));

    setTimeout(() => grunfeld.remove(), 3000);
  },
});

// 3. 콜백을 사용한 고급 옵션
const advancedScenario = grunfeld.scenario(
  "advanced",
  {
    step1: () => console.log("첫 번째 단계"),
    step2: () => console.log("두 번째 단계"),
    step3: () => {
      throw new Error("테스트 오류");
    },
    step4: () => console.log("네 번째 단계"),
  },
  {
    stopOnError: false, // 오류가 있어도 계속 진행
    stepDelay: 1000, // 각 단계 사이에 1초 지연
    onStepStart: (stepName) => console.log(`시작: ${stepName}`),
    onStepEnd: (stepName) => console.log(`완료: ${stepName}`),
    onStepError: (stepName, error) =>
      console.log(`오류 in ${stepName}:`, error.message),
  }
);

export {
  advancedScenario,
  dataFlowScenario,
  handleBasicLogin,
  handleLogin,
  handleQuickLogin,
  loginScenario,
  paymentScenario,
  userRegistrationScenario,
};
