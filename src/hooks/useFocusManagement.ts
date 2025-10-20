import { RefObject, useEffect } from "react";

/**
 * 대화상자의 포커스 관리를 처리하는 훅
 * 포커스 트래핑, 자동 포커스, 이전 포커스 복원 등을 관리
 */
export function useFocusManagement<T extends HTMLElement>(
  elementRef: RefObject<T>
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 이전에 포커스된 요소 저장
    const previousActiveElement = document.activeElement as HTMLElement;

    // 대화상자 내의 포커스 가능한 요소들 찾기
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // 첫 번째 포커스 가능한 요소에 포커스 (스크롤 발생 방지)
    const firstFocusable =
      focusableElements.length > 0
        ? (focusableElements[0] as HTMLElement)
        : null;
    try {
      if (firstFocusable && typeof firstFocusable.focus === "function") {
        firstFocusable.focus({ preventScroll: true } as FocusOptions);
      } else if (typeof element.focus === "function") {
        element.focus({ preventScroll: true } as FocusOptions);
      }
    } catch (e) {
      // 일부 환경(구형 브라우저/테스트 환경)에서는 옵션을 받지 못할 수 있으므로 폴백
      if (firstFocusable && typeof firstFocusable.focus === "function") {
        firstFocusable.focus();
      } else if (typeof element.focus === "function") {
        element.focus();
      }
    }

    // 포커스 트래핑 (Tab 키 순환)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab (역방향)
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab (정방향)
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // 키보드 이벤트 리스너 추가
    element.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이전 포커스 복원
    return () => {
      element.removeEventListener("keydown", handleKeyDown);

      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === "function"
      ) {
        try {
          previousActiveElement.focus({ preventScroll: true } as FocusOptions);
        } catch (e) {
          previousActiveElement.focus();
        }
      }
    };
  }, [elementRef]);
}
