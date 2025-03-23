import { useEffect, useState } from "react";
import { GrunfeldStore } from "./GrunfeldStore";
import styles from "./styles/Grunfeld.module.css";
import clsx from "clsx";
import { Position } from "./types";

export function GrunfeldWrapper({children, defaultPosition = 'center'}: {children: React.ReactNode, defaultPosition?: Position}) {
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
          {Object.entries(GrunfeldStore.store).map(([id, {position, element}]) => 
            {
              console.log('position', position)
              return <Grunfeld key={id} position={position ?? defaultPosition}>{element}</Grunfeld>
            }
          )}
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
      <div className={clsx(styles.dialog, styles[position])}>
        {children}
      </div>
    </div>
  );
}
