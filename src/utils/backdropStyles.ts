import { BackdropStyle } from "../types";

/**
 * Dialog의 backdrop 스타일을 CSS 문자열로 변환합니다.
 */
export function convertBackdropStyleToCSS(
  backdropStyle: BackdropStyle
): string {
  return Object.entries(backdropStyle)
    .map(([key, value]) => {
      // camelCase를 kebab-case로 변환
      const cssProperty = key
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();

      // 값에 세미콜론이나 중괄호가 있으면 이스케이프
      const safeValue = String(value).replace(/[;{}]/g, "");

      return `${cssProperty}: ${safeValue}`;
    })
    .join("; ");
}

/**
 * Dialog용 고유한 CSS 클래스명을 생성합니다.
 */
export function generateDialogClassName(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `grunfeld-dialog-${timestamp}-${random}`;
}

/**
 * Dialog의 backdrop 스타일을 동적으로 적용하고 정리하는 함수들을 반환합니다.
 */
export function createDialogBackdropManager(
  dialog: HTMLDialogElement,
  backdropStyle?: BackdropStyle
) {
  if (!backdropStyle) {
    return { cleanup: () => {} };
  }

  // 브라우저에서 ::backdrop 지원 여부 확인 (테스트 환경에서는 건너뛰기)
  const supportsBackdrop = (() => {
    try {
      return (
        typeof CSS !== "undefined" &&
        (CSS.supports("selector(::backdrop)") ||
          CSS.supports("selector(::-webkit-backdrop)"))
      );
    } catch {
      return true; // 테스트 환경에서는 지원한다고 가정
    }
  })();

  if (process.env.NODE_ENV === "development" && !supportsBackdrop) {
    console.warn(
      "Grunfeld: ::backdrop pseudo-element is not supported in this browser"
    );
  }

  // 고유한 클래스명 생성
  const className = generateDialogClassName();
  dialog.classList.add(className);

  // 스타일 요소 생성 및 삽입
  const styleElement = document.createElement("style");
  const cssText = convertBackdropStyleToCSS(backdropStyle);

  // !important를 추가해서 특이성 문제 해결
  const backdropRule = `.${className}::backdrop { ${cssText} !important; }`;

  // 브라우저별 벤더 프리픽스도 함께 추가
  styleElement.textContent = [
    backdropRule,
    `.${className}::-webkit-backdrop { ${cssText} !important; }`, // Webkit 브라우저용
  ].join("\n");

  // head에 추가하기 전에 기존 스타일 확인
  const existingStyle = document.head.querySelector(
    `style[data-grunfeld="${className}"]`
  );

  if (!existingStyle) {
    styleElement.setAttribute("data-grunfeld", className);
    document.head.appendChild(styleElement);

    // 디버깅: 스타일이 제대로 적용되었는지 확인
    if (process.env.NODE_ENV === "development") {
      console.log("Grunfeld backdrop style applied:", {
        className,
        cssText,
        backdropRule,
      });
    }
  }

  return {
    cleanup: () => {
      // 정리: 스타일 요소 제거
      const styleToRemove = document.head.querySelector(
        `style[data-grunfeld="${className}"]`
      );
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
      dialog.classList.remove(className);
    },
  };
}
