import { ReactElement, useEffect, useState } from "react";
import { GrunfeldStore } from "./GrunfeldStore";
import { getPositionStyles } from "./util/getPositionStyles";
import { Position } from "./types/position";

export default function GrunfeldWrapper({children, position = "top-center"}: {children: ReactElement, position?: Position}) {
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
      {GrunfeldStore.store && <Grunfeld position={position} />}
    </>
  )
}

function Grunfeld({position}: {position: Position}) {
  return <div style={{
    ...getPositionStyles(position)
  }}>{GrunfeldStore.store?.message} <button onClick={() => GrunfeldStore.store = undefined}>X</button></div>
}

