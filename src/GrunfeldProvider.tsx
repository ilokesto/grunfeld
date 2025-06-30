import { useEffect, useState } from "react";
import { GrunfeldStore } from "./GrunfeldStore";
import { Position } from "./types";
import styles from "./styles/Grunfeld.module.css";
import clsx from "clsx";

export function GrunfeldProvider({children, defaultPosition = 'center'}: {children: React.ReactNode, defaultPosition?: Position}) {
  const [_, grunfeldRerenderingTrigger] = useState(false)

  useEffect(() => {
    const handleStoreChange = () => {
      grunfeldRerenderingTrigger((prev) => !prev);
    };

    GrunfeldStore.addListener(handleStoreChange);
    return () => GrunfeldStore.removeListener(handleStoreChange);
  }, []);

  return (
    <>
      {children}

      {!GrunfeldStore.isStoreEmpty() &&
        <div className={styles.wrapper}>
          {GrunfeldStore.store.map(({position, element}, index) =>  <Grunfeld key={index} position={position ?? defaultPosition}>{element}</Grunfeld>)}
        </div>
      }
    </>
  );
}

function Grunfeld({children, position}: {children: React.ReactNode, position: Position }) {
  return (
    <div
      className={styles.backdrop}
      onClick={e => e.target === e.currentTarget && GrunfeldStore.removeDialog()}
    >
      <div className={clsx(styles.dialog, styles[position])} role="dialog">
        {children}
      </div>
    </div>
  );
}
