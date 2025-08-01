import { GrunfeldProvider } from "./components/GrunfeldProvider";
import grunfeld from "./store/GrunfeldStore";

// 타입들도 export
export type { GrunfeldElementProps, GrunfeldProps, Position } from "./types";

// 주요 컴포넌트와 스토어 export
export { grunfeld, GrunfeldProvider };
