import { useState, useRef, useEffect } from "react";
import { GrunfeldStore } from "../GrunfeldStore";

export function useProgress(timeout: number | undefined) {
  const [progress, setProgress] = useState(0); // 프로그레스 상태 관리
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timeout) return; // timeout이 없으면 애니메이션을 실행하지 않음

    const startTime = performance.now();

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const percentage = Math.min((elapsed / timeout) * 100, 100); // 100%를 넘지 않게 제한

      setProgress(percentage);

      if (percentage < 100) {
        window.requestAnimationFrame(updateProgress); // 다음 프레임 요청
      } else {
        GrunfeldStore.store = undefined; // 완료 후 스토어 초기화
      }
    };

    const animationId = window.requestAnimationFrame(updateProgress);

    return () => {
      window.cancelAnimationFrame(animationId); // 컴포넌트 언마운트 시 애니메이션 중지
    };
  }, [timeout]);

  return { divRef, progress };
}