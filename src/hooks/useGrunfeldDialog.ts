import { useEffect, useRef } from "react";
import { createDialogBackdropManager } from "../utils";
import { useGrunfeldBehavior } from "./useGrunfeldBehavior";

export function useDialog(
  lightDismiss: boolean,
  backdropStyle?: React.CSSProperties
) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 공통 행동 처리
  const { handleBackdropClick, handleDialogClose } = useGrunfeldBehavior({
    lightDismiss,
  });

  // Dialog를 top-layer에 표시하고 이벤트 관리
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // StrictMode (개발)에서 useEffect가 두 번 실행되는 상황을 안전하게 처리하기 위해
    // showModal() 호출을 다음 태스크로 지연시킵니다. 이렇게 하면 마운트-언마운트-마운트
    // 패턴에서 첫 번째 마운트의 cleanup이 dialog.close()를 호출하는 것을 방지할 수 있습니다.
    let showTimer: number | null = null;
    let hasShown = false;

    showTimer = window.setTimeout(() => {
      try {
        dialog.showModal();
        hasShown = true;
      } catch (e) {
        // 일부 환경(예: 테스트)에서는 dialog.showModal()이 동작하지 않을 수 있음
      }
    }, 0);

    // ESC 키와 close 이벤트를 브라우저가 자동으로 처리
    dialog.addEventListener("close", handleDialogClose);

    return () => {
      dialog.removeEventListener("close", handleDialogClose);
      if (showTimer !== null) {
        clearTimeout(showTimer);
      }
      // 실제로 showModal()이 호출되어 열린 경우에만 close() 시도
      try {
        if (hasShown && dialog.open) {
          dialog.close();
        }
      } catch (e) {
        // 안전하게 무시
      }
    };
  }, [handleDialogClose]);

  // backdrop 스타일 관리
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !backdropStyle) return;

    const { cleanup } = createDialogBackdropManager(dialog, backdropStyle);
    return cleanup;
  }, [backdropStyle]);

  return { dialogRef, handleBackdropClick, handleDialogClose };
}
