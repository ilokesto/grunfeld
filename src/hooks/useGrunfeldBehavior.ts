import { useCallback, useEffect } from "react";
import GrunfeldStore from "../store/GrunfeldStore";
import { GrunfeldElementProps } from "../types";

interface UseGrunfeldBehaviorProps
  extends Pick<GrunfeldElementProps, "lightDismiss"> {}

/**
 * Grunfeld 컴포넌트들의 공통 행동을 관리하는 훅
 * ESC 키 처리, backdrop 클릭 등의 공통 기능을 제공
 */
export function useGrunfeldBehavior({
  lightDismiss = true,
}: UseGrunfeldBehaviorProps = {}) {
  // ESC 키로 대화상자 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && lightDismiss) {
        event.preventDefault();
        GrunfeldStore.remove();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [lightDismiss]);

  // backdrop 클릭 핸들러
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && lightDismiss) {
        GrunfeldStore.remove();
      }
    },
    [lightDismiss]
  );

  // Dialog close 이벤트 핸들러 (HTML dialog 전용)
  const handleDialogClose = useCallback(() => {
    GrunfeldStore.remove();
  }, []);

  return {
    handleBackdropClick,
    handleDialogClose,
  };
}
