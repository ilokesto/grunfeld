import { useEffect, useMemo, useSyncExternalStore } from "react";
import { GrunfeldStore } from "../store/GrunfeldStore";
import { GrunfeldProviderProps } from "../types";
import { getMergedProps } from "../utils/getMergedProps";
import { Grunfeld } from "./Grunfeld";

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

    if (store.length > 0) {
      const html = document.documentElement;
      const body = document.body;

      // 이전 값 저장
      const prevHtmlOverflow = html.style.overflow;
      const prevBodyOverflow = body.style.overflow;

      html.style.overflow = "hidden";
      body.style.overflow = "hidden";

      return () => {
        html.style.overflow = prevHtmlOverflow;
        body.style.overflow = prevBodyOverflow;
      };
    }
    return;
  }, [store.length]);

  // 대화상자 렌더링 최적화
  const renderedDialogs = useMemo(() => {
    return store.map((props, index) => {
      const mergedProps = getMergedProps(props, options);

      console.log("Merged Dialog Props:", mergedProps);

      return <Grunfeld key={index} {...mergedProps} />;
    });
  }, [store, options]);

  return (
    <>
      {children}

      {store.length > 0 && renderedDialogs}
    </>
  );
}
