import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { GrunfeldStore } from "./GrunfeldStore";
import { getPositionStyles } from "./util/getPositionStyles";
import { Position } from "./types";
import { useProgress } from "./util/useProgress";

export default function GrunfeldWrapper({children, position = "top-center", timeout}: {children: ReactElement | ReactElement[], position?: Position, timeout?: number}) {
  const [_, setCount] = useState(0)

  useEffect(() => {
    const handleStoreChange = () => {
      setCount((count) => count + 1);
    };

    GrunfeldStore.addListener(handleStoreChange);

    return () => {
      GrunfeldStore.removeListener(handleStoreChange);
    };
  }, []);

  return (
    <>
      {children}
      {GrunfeldStore.store && <Grunfeld position={position} timeout={timeout}/>}
    </>
  )
}

function Grunfeld({position, timeout}: {position: Position, timeout?: number}) {
  const time = GrunfeldStore.store?.timeout ?? timeout
  const { divRef, progress} = useProgress(time)

  return <div 
    onClick={() => GrunfeldStore.store = undefined}
    ref={divRef}
    style={{
      ...getPositionStyles(position),
      backgroundColor: "white",
      overflow: "hidden",
      padding: "5px 10px",
      borderRadius: "3px",
      margin: "10px",
    }}>{GrunfeldStore.store?.message}
     <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          backgroundColor: "green",
          width: `${progress}%`, // progress 값을 기반으로 너비 조정
        }}
      />
      </div>
}
