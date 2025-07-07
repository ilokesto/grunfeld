import { GrunfeldProps, isValidGrunfeldElement } from "../types";
import { logger } from "../utils/logger";
import { hashManager } from "./GrunfeldHashManager";

type Store = Array<GrunfeldProps>;
type Callback = () => void;
type RemoveWithFunction<T> = (data: T) => T;
type DialogFactory<T> = (
  removeWith: RemoveWithFunction<T>
) => GrunfeldProps | Promise<GrunfeldProps>;

function createGrunfeldStore() {
  const callbacks = new Set<Callback>();
  let store: Store = [];

  // 불필요한 배열 생성을 방지하는 최적화된 알림 함수
  const notifyCallbacks = () => {
    if (callbacks.size === 0) return;

    // 스토어의 참조만 변경하여 리렌더링 트리거
    store = [...store];
    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        logger.error("Error in store callback", error);
      }
    });
  };

  return {
    add<T = void>(
      dialogFactory: DialogFactory<T>
    ): T extends void ? void : Promise<T> {
      if (typeof dialogFactory !== "function") {
        throw new Error("dialogFactory must be a function");
      }

      let isAsync = false;
      let dialogProps: GrunfeldProps;

      const removeWith: RemoveWithFunction<T> = (data: T) => {
        try {
          const index = store.indexOf(dialogProps);
          if (index !== -1) {
            hashManager.removeDialog(dialogProps);
            store.splice(index, 1);
            dismissDialog(dialogProps);
            notifyCallbacks();
          }
          if (isAsync) {
            return data;
          }
          return data;
        } catch (error) {
          logger.error("Error in removeWith callback", error);
          if (isAsync) {
            throw error;
          }
          return data;
        }
      };

      try {
        const factoryResult = dialogFactory(removeWith);

        // Promise인지 확인
        if (
          factoryResult &&
          typeof factoryResult === "object" &&
          "then" in factoryResult &&
          typeof (factoryResult as any).then === "function"
        ) {
          isAsync = true;
          return new Promise<T>(async (resolve, reject) => {
            try {
              dialogProps = await factoryResult;

              if (!hashManager.tryAddDialog(dialogProps)) {
                logger.warn("Duplicate async dialog prevented");
                resolve({} as T);
                return;
              }

              store.push(dialogProps);
              notifyCallbacks();
            } catch (error) {
              logger.error("Error in add", error);
              reject(error);
            }
          }) as any;
        } else {
          // 동기적 처리
          dialogProps = factoryResult as GrunfeldProps;

          if (!hashManager.tryAddDialog(dialogProps)) {
            logger.warn("Duplicate dialog prevented");
            return undefined as any;
          }

          store.push(dialogProps);
          notifyCallbacks();
          return undefined as any;
        }
      } catch (error) {
        logger.error("Error in add", error);
        throw error;
      }
    },

    remove() {
      const props = store.pop();
      if (props) {
        hashManager.removeDialog(props);
        dismissDialog(props);
        notifyCallbacks();
      }
    },

    clear() {
      store.forEach(dismissDialog);
      store = [];
      hashManager.clearAll();
      notifyCallbacks();
    },

    getStore: () => store,

    subscribe(callback: Callback) {
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
    },
  };
}

export const GrunfeldStore = createGrunfeldStore();

export default {
  add: GrunfeldStore.add,
  remove: GrunfeldStore.remove,
  clear: GrunfeldStore.clear,
};

function dismissDialog(props: GrunfeldProps) {
  try {
    if (isValidGrunfeldElement(props) && props.dismissCallback) {
      props.dismissCallback();
    }
  } catch (error) {
    logger.error("Error in dismiss callback", error);
  }
}
