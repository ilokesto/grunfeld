import { useEffect, useRef } from "react";
import GrunfeldStore from "../store/GrunfeldStore";
import { GrunfeldElementProps } from "../types";
import { getPositionStyles } from "../utils/getPositionStyles";

export function GrunfeldDialog({
  element,
  position = "center",
  lightDismiss,
  backdropStyle,
}: GrunfeldElementProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Dialog를 top-layer에 표시하고 이벤트 관리
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // showModal()로 top-layer에 표시
    dialog.showModal();

    const handleClose = () => {
      GrunfeldStore.remove();
    };

    // ESC 키와 close 이벤트를 브라우저가 자동으로 처리
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  // backdropStyle을 dialog::backdrop에 적용
  useEffect(() => {
    if (!backdropStyle) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // 브라우저에서 ::backdrop 지원 여부 확인
    const supportsBackdrop =
      CSS.supports("selector(::backdrop)") ||
      CSS.supports("selector(::-webkit-backdrop)");

    if (process.env.NODE_ENV === "development" && !supportsBackdrop) {
      console.warn(
        "Grunfeld: ::backdrop pseudo-element is not supported in this browser"
      );
    }

    // 고유한 클래스명 생성 (더 안전한 방식)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const className = `grunfeld-dialog-${timestamp}-${random}`;
    dialog.classList.add(className);

    // 스타일 요소 생성 및 삽입
    const styleElement = document.createElement("style");

    // CSSProperties 객체를 CSS 문자열로 변환 (개선된 변환 로직)
    const cssText = Object.entries(backdropStyle)
      .map(([key, value]) => {
        // camelCase를 kebab-case로 변환 (더 정확한 변환)
        const cssProperty = key
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .toLowerCase();

        // 값에 세미콜론이나 중괄호가 있으면 이스케이프
        const safeValue = String(value).replace(/[;{}]/g, "");

        return `${cssProperty}: ${safeValue}`;
      })
      .join("; ");

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

    return () => {
      // 정리: 스타일 요소 제거
      const styleToRemove = document.head.querySelector(
        `style[data-grunfeld="${className}"]`
      );
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
      dialog.classList.remove(className);
    };
  }, [backdropStyle]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && lightDismiss) {
      GrunfeldStore.remove();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      style={{
        padding: 0,
        border: "none",
        background: "transparent",
        width: "100vw",
        height: "100vh",
        maxWidth: "none",
        maxHeight: "none",
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
    >
      <div style={getPositionStyles(position, true)}>{element}</div>
    </dialog>
  );
}
