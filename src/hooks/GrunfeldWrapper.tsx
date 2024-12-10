import { ReactElement, useEffect, useState } from "react";
import { GrunfeldStore } from "./GrunfeldStore";
import { getPositionStyles } from "./util/getPositionStyles";
import { Position } from "./types";

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
  if (GrunfeldStore.store?.timeout || timeout) {
    setTimeout(() => {
      GrunfeldStore.store = undefined
    }, GrunfeldStore.store?.timeout ?? timeout)
  }

  return <div 
    onClick={() => GrunfeldStore.store = undefined}
    style={{
      ...getPositionStyles(position),
      backgroundColor: "white",
      padding: "5px 10px",
      borderRadius: "5px",
      margin: "10px",
    }}>{GrunfeldStore.store?.message}</div>
}

