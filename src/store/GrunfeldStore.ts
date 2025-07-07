import { GrunfeldProps, isValidGrunfeldElement } from "../types";
import { logger } from "../utils/logger";
import { hashManager } from "./GrunfeldHashManager";

type Store = Array<GrunfeldProps>;
type Callback = () => void;
type RemoveWithFunction<T> = (data: T) => void;
type DialogFactory<T> = (
  removeWith: RemoveWithFunction<T>
) => GrunfeldProps | Promise<GrunfeldProps>;

function createGrunfeldStore() {
  const callbacks = new Set<Callback>();
  let store: Store = [];
  // Map을 사용하여 모든 타입의 GrunfeldProps를 키로 사용
  const abortControllers = new Map<GrunfeldProps, AbortController>();

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

      return new Promise<T>((resolve, reject) => {
        let dialogProps: GrunfeldProps;
        let isResolved = false;
        const abortController = new AbortController();

        // AbortController의 signal에 abort 이벤트 리스너 추가
        abortController.signal.addEventListener("abort", () => {
          if (!isResolved) {
            isResolved = true;
            // remove()에 의해 중단된 경우 undefined로 resolve
            resolve(undefined as T);
          }
        });

        const removeWith: RemoveWithFunction<T> = (data: T) => {
          if (isResolved) return;

          try {
            const index = store.indexOf(dialogProps);
            if (index !== -1) {
              hashManager.removeDialog(dialogProps);
              store.splice(index, 1);
              dismissDialog(dialogProps);
              // AbortController 정리
              abortControllers.delete(dialogProps);
              notifyCallbacks();
            }

            isResolved = true;
            resolve(data);
          } catch (error) {
            logger.error("Error in removeWith callback", error);
            if (!isResolved) {
              isResolved = true;
              reject(error);
            }
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
            // 비동기 dialogFactory 처리
            (factoryResult as Promise<GrunfeldProps>)
              .then((props) => {
                if (abortController.signal.aborted) return;

                dialogProps = props;
                // AbortController를 dialogProps와 연결
                abortControllers.set(dialogProps, abortController);

                if (!hashManager.tryAddDialog(dialogProps)) {
                  logger.warn("Duplicate async dialog prevented");
                  if (!isResolved) {
                    isResolved = true;
                    resolve({} as T);
                  }
                  return;
                }

                store.push(dialogProps);
                notifyCallbacks();
              })
              .catch((error) => {
                if (abortController.signal.aborted) return;

                logger.error("Error in async dialogFactory", error);
                if (!isResolved) {
                  isResolved = true;
                  reject(error);
                }
              });
          } else {
            // 동기적 dialogFactory 처리
            if (abortController.signal.aborted) return;

            dialogProps = factoryResult as GrunfeldProps;
            // AbortController를 dialogProps와 연결
            abortControllers.set(dialogProps, abortController);

            if (!hashManager.tryAddDialog(dialogProps)) {
              logger.warn("Duplicate dialog prevented");
              if (!isResolved) {
                isResolved = true;
                resolve({} as T);
              }
              return;
            }

            store.push(dialogProps);
            notifyCallbacks();
          }
        } catch (error) {
          logger.error("Error in dialogFactory", error);
          if (!isResolved) {
            isResolved = true;
            reject(error);
          }
        }
      }) as any;
    },

    remove() {
      const props = store.pop();
      if (props) {
        hashManager.removeDialog(props);

        // 해당 다이얼로그의 Promise를 abort로 정리
        const abortController = abortControllers.get(props);
        if (abortController) {
          abortController.abort();
          abortControllers.delete(props);
        }

        dismissDialog(props);
        notifyCallbacks();
      }
    },

    clear() {
      // 모든 pending Promise들을 abort로 정리
      store.forEach((props) => {
        const abortController = abortControllers.get(props);
        if (abortController) {
          abortController.abort();
          abortControllers.delete(props);
        }
        dismissDialog(props);
      });

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
