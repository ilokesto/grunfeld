import { GrunfeldElementProps } from "../types";
import { GrunfeldDialog } from "./GrunfeldDialog";
import { GrunfeldModal } from "./GrunfeldModal";

/**
 * 테스트용/호환용 간단한 Grunfeld 팩토리 함수
 * renderMode에 따라 GrunfeldDialog 또는 GrunfeldModal을 반환합니다.
 */
export function Grunfeld(props: GrunfeldElementProps) {
  const { renderMode = "inline", ...rest } = props;

  if (renderMode === "top-layer") {
    return <GrunfeldDialog {...(rest as any)} />;
  }

  return <GrunfeldModal {...(rest as any)} />;
}

export default Grunfeld;
