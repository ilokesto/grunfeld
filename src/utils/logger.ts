/**
 * Grunfeld 라이브러리용 로깅 유틸리티
 * 개발 환경에서만 경고 메시지를 출력하고, 에러는 항상 로깅합니다.
 */

const PREFIX = "[Grunfeld]";

export const logger = {
  /**
   * 경고 메시지를 출력합니다 (개발 환경에서만)
   */
  warn: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`${PREFIX} ${message}`, data || "");
    }
  },

  /**
   * 에러 메시지를 출력합니다 (모든 환경에서)
   */
  error: (message: string, error?: Error | unknown): void => {
    console.error(`${PREFIX} ${message}`, error || "");
  },

  /**
   * 디버그 메시지를 출력합니다 (개발 환경에서만)
   */
  debug: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`${PREFIX} ${message}`, data || "");
    }
  },
};
