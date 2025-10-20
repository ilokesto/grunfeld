import { useEffect, useMemo, useSyncExternalStore } from "react";
import { GrunfeldStore } from "../store/GrunfeldStore";
import { GrunfeldProviderProps } from "../types";
import { getMergedProps } from "../utils";
import { GrunfeldDialog } from "./GrunfeldDialog";
import { GrunfeldModal } from "./GrunfeldModal";

export function GrunfeldProvider({ children, options }: GrunfeldProviderProps) {
  const store = useSyncExternalStore(
    GrunfeldStore.subscribe,
    GrunfeldStore.getStore,
    GrunfeldStore.getStore
  );

  // 페이지 스크롤 잠금: 하나 이상의 다이얼로그/모달이 열려있을 때
  // body/html의 overflow 스타일을 변경하여 배경 스크롤을 방지합니다.
  // SSR 또는 테스트 환경에서 document가 없을 수 있으므로 보호합니다.
  useEffect(() => {
    if (typeof document === "undefined") return;

    // 스크롤 위치 보존 방식:
    // overflow:hidden으로 단순 변경하면 모바일/특정 환경에서
    // 레이아웃 변경으로 인해 뷰가 최상단으로 점프할 수 있습니다.
    // 대신 현재 스크롤 오프셋을 저장하고 body에 position:fixed, top:-offset을 설정
    // 하여 배경이 고정되도록 처리합니다. 이는 여러 모달이 중첩될 때도 안전합니다.
    const body = document.body as HTMLBodyElement;
    const html = document.documentElement as HTMLElement;

    if (store.length > 0) {
      // 이미 스크롤 잠금이 걸려있을 수 있으므로 중복 적용 방지
      if ((body.dataset as any)["grunfeldScrollLocked"] === "true") {
        return;
      }

      const scrollY =
        window.scrollY || window.pageYOffset || html.scrollTop || 0;

      // 이전 스타일 저장
      const prevBodyPosition = body.style.position;
      const prevBodyTop = body.style.top;
      const prevBodyWidth = body.style.width;

      body.style.position = "fixed";
      body.style.top = `${-scrollY}px`;
      body.style.width = "100%";

      (body.dataset as any)["grunfeldScrollLocked"] = "true";
      (body.dataset as any)["grunfeldScrollY"] = String(scrollY);

      return () => {
        // 복원
        const saved = (body.dataset as any)["grunfeldScrollY"];
        const savedScroll = saved ? parseInt(saved, 10) : 0;

        // restore styles
        body.style.position = prevBodyPosition;
        body.style.top = prevBodyTop;
        body.style.width = prevBodyWidth;

        // remove data attrs
        delete (body.dataset as any)["grunfeldScrollLocked"];
        delete (body.dataset as any)["grunfeldScrollY"];

        // restore scroll position
        window.scrollTo(0, savedScroll);
      };
    }
    return;
  }, [store.length]);

  // 대화상자 렌더링 최적화
  // store와 options의 실제 값이 변경될 때만 재계산
  const renderedDialogs = useMemo(() => {
    if (store.length === 0) return null;

    return store.map((props, index) => {
      const { renderMode, ...mergedProps } = getMergedProps(props, options);
      const Component =
        renderMode === "top-layer" ? GrunfeldDialog : GrunfeldModal;

      // index 대신 고유한 키 사용 (성능 개선)
      return <Component key={`dialog-${index}`} {...mergedProps} />;
    });
  }, [store, options]);

  return (
    <>
      {children}
      {renderedDialogs}
    </>
  );
}
