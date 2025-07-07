import { GrunfeldProps, isValidGrunfeldElement } from "./types";

const dialogHashes = new Set<string>();

export function generateDialogHash(dialog: any): string {
  // GrunfeldProps 유니온 타입에 맞게 해시 생성
  if (isValidGrunfeldElement(dialog)) {
    // 객체 형태의 GrunfeldProps
    const hashableProps = {
      position: dialog.position,
      lightDismiss: dialog.lightDismiss,
      elementType: typeof dialog.element,
      elementProps:
        dialog.element &&
        typeof dialog.element === "object" &&
        "type" in dialog.element
          ? JSON.stringify(dialog.element.props)
          : String(dialog.element),
    };

    try {
      return btoa(JSON.stringify(hashableProps)).replace(/[^a-zA-Z0-9]/g, "");
    } catch {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
  } else {
    // React.ReactNode 형태의 GrunfeldProps
    try {
      const nodeHash =
        typeof dialog === "object" && dialog && "type" in dialog
          ? JSON.stringify({
              type: (dialog as any).type,
              props: (dialog as any).props,
            })
          : String(dialog);
      return btoa(nodeHash).replace(/[^a-zA-Z0-9]/g, "");
    } catch {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
  }
}

// 해시 관리 유틸리티 함수들
export const hashManager = {
  // 중복 체크 및 추가
  tryAddDialog(dialog: GrunfeldProps): boolean {
    const hash = generateDialogHash(dialog);

    if (dialogHashes.has(hash)) {
      console.warn("Duplicate dialog prevented:", hash);
      return false;
    }

    dialogHashes.add(hash);
    return true;
  },

  // 해시 제거
  removeDialog(dialog: GrunfeldProps): void {
    const hash = generateDialogHash(dialog);
    dialogHashes.delete(hash);
  },

  // 모든 해시 제거
  clearAll(): void {
    dialogHashes.clear();
  },
};
