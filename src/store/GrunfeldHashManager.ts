import {
  GrunfeldElementProps,
  GrunfeldProps,
  isReactElement,
  isSerializable,
  isValidGrunfeldElement,
} from "../types";
import { logger } from "../utils/logger";

const dialogHashes = new Set<string>();

/**
 * 직렬화 가능한 객체를 안전하게 문자열로 변환합니다.
 */
function safeStringify(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return String(obj);
  }

  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    return String(obj);
  }

  if (!isSerializable(obj)) {
    logger.debug("Object is not serializable, using fallback", obj);
    return `[${typeof obj}]`;
  }

  try {
    return JSON.stringify(obj);
  } catch (error) {
    logger.warn("Failed to stringify object", error);
    return `[${typeof obj}]`;
  }
}

/**
 * GrunfeldElementProps에서 해시 생성용 데이터를 추출합니다.
 */
function serializeElementProps(
  props: GrunfeldElementProps
): Record<string, unknown> {
  const { element, position, lightDismiss, renderMode, backdropStyle } = props;

  return {
    position,
    lightDismiss,
    renderMode,
    backdropStyle: isSerializable(backdropStyle)
      ? backdropStyle
      : "[Non-serializable]",
    elementType: typeof element,
    elementProps: isReactElement(element)
      ? {
          type: typeof element.type === "string" ? element.type : "[Component]",
          props: isSerializable(element.props)
            ? element.props
            : "[Non-serializable]",
        }
      : safeStringify(element),
  };
}

/**
 * React.ReactNode에서 해시 생성용 데이터를 추출합니다.
 */
function serializeReactNode(node: React.ReactNode): Record<string, unknown> {
  if (isReactElement(node)) {
    return {
      type: typeof node.type === "string" ? node.type : "[Component]",
      props: isSerializable(node.props) ? node.props : "[Non-serializable]",
    };
  }

  return {
    nodeType: typeof node,
    value: safeStringify(node),
  };
}

/**
 * 안전한 Base64 인코딩을 수행합니다.
 */
function createHash(data: Record<string, unknown>): string {
  try {
    const serialized = JSON.stringify(data);
    return btoa(serialized).replace(/[^a-zA-Z0-9]/g, "");
  } catch (error) {
    logger.warn("Hash creation failed, using fallback", error);
    return generateFallbackHash();
  }
}

/**
 * 해시 생성에 실패했을 때 사용할 fallback 해시를 생성합니다.
 */
function generateFallbackHash(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}${random}`;
}

export function generateDialogHash(dialog: GrunfeldProps): string {
  try {
    // Normalize dialog into a GrunfeldElementProps-like shape so hashing is stable
    const normalized: GrunfeldElementProps = isValidGrunfeldElement(dialog)
      ? ({ ...(dialog as GrunfeldElementProps) } as GrunfeldElementProps)
      : ({ element: dialog } as GrunfeldElementProps);

    // Fill defaults that getMergedProps would provide (keeps hash stable)
    normalized.position ??= "center";
    normalized.lightDismiss ??= true;
    normalized.renderMode ??= "inline" as any;
    normalized.backdropStyle ??= { backgroundColor: "rgba(0, 0, 0, 0.3)" };

    const serializedProps = serializeElementProps(normalized);
    return createHash(serializedProps);
  } catch (error) {
    logger.error("Unexpected error during hash generation", error);
    return generateFallbackHash();
  }
}

// 해시 관리 유틸리티 함수들
export const hashManager = {
  /**
   * 중복 체크를 수행하고 새로운 대화상자를 추가합니다.
   * @param dialog 추가할 대화상자
   * @returns 성공적으로 추가되었으면 true, 중복으로 인해 거부되었으면 false
   */
  tryAddDialog(dialog: GrunfeldProps): boolean {
    const hash = generateDialogHash(dialog);

    if (dialogHashes.has(hash)) {
      logger.warn("Duplicate dialog prevented", { hash });
      return false;
    }

    dialogHashes.add(hash);
    logger.debug("Dialog added", { hash });
    return true;
  },

  /**
   * 대화상자에 해당하는 해시를 제거합니다.
   * @param dialog 제거할 대화상자
   */
  removeDialog(dialog: GrunfeldProps): void {
    const hash = generateDialogHash(dialog);
    const wasRemoved = dialogHashes.delete(hash);

    if (wasRemoved) {
      logger.debug("Dialog removed", { hash });
    } else {
      logger.warn("Attempted to remove non-existent dialog", { hash });
    }
  },

  /**
   * 모든 대화상자 해시를 제거합니다.
   */
  clearAll(): void {
    const count = dialogHashes.size;
    dialogHashes.clear();
    logger.debug("All dialogs cleared", { count });
  },

  /**
   * 현재 등록된 해시의 개수를 반환합니다.
   */
  getHashCount(): number {
    return dialogHashes.size;
  },
};
