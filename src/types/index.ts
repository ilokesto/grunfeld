// 통합된 타입 가드 시스템
export * from "./typeGuards";

// 시나리오 타입
export * from "./scenario";

// 레거시 호환성을 위한 개별 export (deprecated)
export {
  isReactElement,
  isSerializable,
  isValidGrunfeldElement,
} from "./typeGuards";

type PositionX = "left" | "center" | "right";
type PositionY = "top" | "center" | "bottom";

export type Position = `${PositionY}-${PositionX}` | "center";

export type BackdropStyle = React.CSSProperties;

export interface GrunfeldElementProps {
  element: React.ReactNode;
  dismissCallback?: () => unknown;
  position?: Position;
  lightDismiss?: boolean;
  renderMode?: "top-layer" | "inline";
  backdropStyle?: BackdropStyle;
}

export type GrunfeldProps = GrunfeldElementProps | React.ReactNode;

export type GrunfeldProviderProps = {
  children: React.ReactNode;
  options?: AddDefaultToKeys<
    Omit<GrunfeldElementProps, "element" | "dismissCallback">
  >;
};

type AddDefaultToKeys<T extends Record<string, unknown>> = {
  [K in keyof T as K extends string ? `default${Capitalize<K>}` : never]: T[K];
};
