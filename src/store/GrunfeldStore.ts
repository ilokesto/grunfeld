import {
  ExecutableScenario,
  GrunfeldProps,
  isValidGrunfeldElement,
  ScenarioControllerFactory,
  ScenarioDefinition,
  ScenarioImplementationFunction,
} from "../types";
import { logger } from "../utils/logger";
import { hashManager } from "./GrunfeldHashManager";
import { createScenario, createSeparatedScenario } from "./ScenarioManager";

type DialogFactoryFunction = {
  (dialogFactory: () => GrunfeldProps): void;
  <T>(dialogFactory: (removeWith: (data: T) => void) => GrunfeldProps): Promise<
    T | undefined
  >;
};

type DialogStore = Array<GrunfeldProps>;
type StoreSubscriber = () => void;

interface GrunfeldStoreInterface {
  add: DialogFactoryFunction;
  remove(): void;
  clear(): void;
  getStore(): DialogStore;
  subscribe(subscriber: StoreSubscriber): StoreSubscriber;

  /**
   * 시나리오 생성 메서드 - 두 가지 패턴 지원
   *
   * 1. 기본 객체 방식:
   *    grunfeld.scenario(name, definition)
   *
   * 2. 분리된 방식:
   *    grunfeld.scenario(name, controllerFactory, implementation)
   */
  scenario: {
    // 기본 객체 시나리오
    <TDefinition extends ScenarioDefinition>(
      name: string,
      definition: TDefinition
    ): ExecutableScenario<TDefinition>;

    // 분리된 시나리오 (controllerFactory + implementation)
    <
      TImplementation extends ScenarioDefinition,
      TController extends Record<string, ScenarioImplementationFunction>
    >(
      name: string,
      controllerFactory: ScenarioControllerFactory<
        TImplementation,
        TController
      >,
      implementation: TController
    ): ExecutableScenario<TController>;
  };
}
function createGrunfeldStore(): GrunfeldStoreInterface {
  const subscribers = new Set<StoreSubscriber>();
  let dialogStore: DialogStore = [];
  // Map을 사용하여 모든 타입의 GrunfeldProps를 키로 사용
  const abortControllers = new Map<GrunfeldProps, AbortController>();

  // 최적화된 알림 함수 - 구독자가 있을 때만 실행
  const notifySubscribers = () => {
    if (subscribers.size === 0) return;

    subscribers.forEach((subscriber) => {
      try {
        subscriber();
      } catch (error) {
        logger.error("Error in store subscriber", error);
      }
    });
  };

  return {
    add(dialogFactory: any): any {
      if (typeof dialogFactory !== "function") {
        throw new Error("dialogFactory must be a function");
      }

      // 함수의 매개변수 개수로 오버로드를 구분
      if (dialogFactory.length === 0) {
        // 첫 번째 오버로드: () => GrunfeldProps -> void (동기)
        try {
          const factoryResult = dialogFactory();

          // 동기적으로 처리
          if (!hashManager.tryAddDialog(factoryResult)) {
            logger.warn("Duplicate dialog prevented");
            return;
          }

          dialogStore.push(factoryResult);
          // 새 참조를 만들어 useSyncExternalStore가 변경을 감지하도록 함
          dialogStore = [...dialogStore];
          notifySubscribers();
        } catch (error) {
          logger.error("Error in dialogFactory", error);
        }
      } else {
        // 두 번째 오버로드: <T>(removeWith: RemoveWithFunction<T>) => GrunfeldProps
        return new Promise((resolve, reject) => {
          let dialogProps: GrunfeldProps;
          let isResolved = false;
          const abortController = new AbortController();

          // AbortController의 signal에 abort 이벤트 리스너 추가
          abortController.signal.addEventListener("abort", () => {
            if (!isResolved) {
              isResolved = true;
              // remove()에 의해 중단된 경우 undefined로 resolve
              resolve(undefined);
            }
          });

          const removeWith = (data: any) => {
            if (isResolved) return;

            try {
              const index = dialogStore.indexOf(dialogProps);
              if (index !== -1) {
                hashManager.removeDialog(dialogProps);
                dialogStore.splice(index, 1);
                dismissDialog(dialogProps);
                // AbortController 정리
                abortControllers.delete(dialogProps);
                // splice로 내부 배열 변경이 발생했으므로 새로운 참조로 갱신
                dialogStore = [...dialogStore];
                notifySubscribers();
              }

              isResolved = true;
              resolve(data);
            } catch (error) {
              logger.error("Error in removeWith subscriber", error);
              if (!isResolved) {
                isResolved = true;
                reject(error);
              }
            }
          };

          try {
            const factoryResult = dialogFactory(removeWith);

            // 동기적으로 처리
            if (abortController.signal.aborted) return;

            dialogProps = factoryResult;
            // AbortController를 dialogProps와 연결
            abortControllers.set(dialogProps, abortController);

            if (!hashManager.tryAddDialog(dialogProps)) {
              logger.warn("Duplicate dialog prevented");
              if (!isResolved) {
                isResolved = true;
                resolve(undefined);
              }
              return;
            }

            dialogStore.push(dialogProps);
            // 새 참조로 변경
            dialogStore = [...dialogStore];
            notifySubscribers();
          } catch (error) {
            logger.error("Error in dialogFactory", error);
            if (!isResolved) {
              isResolved = true;
              reject(error);
            }
          }
        });
      }
    },

    remove() {
      const props = dialogStore.pop();
      if (props) {
        hashManager.removeDialog(props);

        // 해당 다이얼로그의 Promise를 abort로 정리
        const abortController = abortControllers.get(props);
        if (abortController) {
          abortController.abort();
          abortControllers.delete(props);
        }

        dismissDialog(props);
        // pop으로 내부 변경이 발생했으므로 새로운 참조로 갱신
        dialogStore = [...dialogStore];
        notifySubscribers();
      }
    },

    clear() {
      // 모든 pending Promise들을 abort로 정리
      dialogStore.forEach((props: GrunfeldProps) => {
        const abortController = abortControllers.get(props);
        if (abortController) {
          abortController.abort();
          abortControllers.delete(props);
        }
        dismissDialog(props);
      });

      dialogStore = [];
      // 새 참조로 변경
      dialogStore = [...dialogStore];
      hashManager.clearAll();
      notifySubscribers();
    },

    getStore: () => dialogStore,

    subscribe(subscriber: StoreSubscriber) {
      subscribers.add(subscriber);
      return () => {
        subscribers.delete(subscriber);
      };
    },

    scenario: (
      name: string,
      definitionOrControllerFactory: any,
      implementation?: any
    ) => {
      // 분리된 시나리오: 3개 인자 = scenario(name, factory, implementation)
      if (implementation !== undefined) {
        if (typeof definitionOrControllerFactory !== "function") {
          throw new Error(
            "Separated scenario requires controller factory function as second argument"
          );
        }
        if (!implementation || typeof implementation !== "object") {
          throw new Error(
            "Separated scenario requires implementation object as third argument"
          );
        }
        return createSeparatedScenario(
          name,
          definitionOrControllerFactory,
          implementation
        );
      }

      // 기본 객체 시나리오: 2개 인자 = scenario(name, definition)
      if (typeof definitionOrControllerFactory === "function") {
        throw new Error(
          "Controller factory function alone is not supported. Use either:\n" +
            "- Basic scenario: scenario(name, definition)\n" +
            "- Separated scenario: scenario(name, controllerFactory, implementation)"
        );
      }

      return createScenario(name, definitionOrControllerFactory);
    },
  };
}

export const GrunfeldStore = createGrunfeldStore();

export default {
  add: GrunfeldStore.add,
  remove: GrunfeldStore.remove,
  clear: GrunfeldStore.clear,
  getStore: GrunfeldStore.getStore,
  scenario: GrunfeldStore.scenario,
};

function dismissDialog(props: GrunfeldProps) {
  try {
    if (isValidGrunfeldElement(props) && props.dismissCallback) {
      props.dismissCallback();
    }
  } catch (error) {
    logger.error("Error in dismiss subscriber", error);
  }
}
