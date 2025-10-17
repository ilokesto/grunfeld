import {
  ExecutableScenario,
  ScenarioControllerFactory,
  ScenarioDefinition,
  ScenarioExecutionOptions,
  ScenarioImplementationFunction,
  ScenarioInstance,
} from "../types";
import { logger } from "../utils/logger";

/**
 * 시나리오 실행을 담당하는 클래스
 * 시나리오 워크플로우 관리 및 동적 메서드 접근 지원
 */
class ScenarioExecutor implements ScenarioInstance {
  private readonly scenarioName: string;
  private readonly scenarioDefinition: ScenarioDefinition;
  private readonly executionOptions: Required<ScenarioExecutionOptions>;

  constructor(
    name: string,
    definition: ScenarioDefinition,
    options: ScenarioExecutionOptions = {}
  ) {
    this.scenarioName = name;
    this.scenarioDefinition = { ...definition }; // 복사본 생성
    this.executionOptions = {
      stepDelay: options.stepDelay ?? 0,
      onStepStart: options.onStepStart ?? (() => {}),
      onStepEnd: options.onStepEnd ?? (() => {}),
      onStepError: options.onStepError ?? (() => {}),
    };

    logger.debug(
      `Scenario '${name}' created with ${this.getSteps().length} steps`,
      {
        steps: this.getSteps(),
        options: this.executionOptions,
      }
    );

    // Proxy를 사용하여 동적 메서드 접근 활성화
    return new Proxy(this, {
      get(target, prop, receiver) {
        // 기존 메서드/속성인 경우 그대로 반환
        if (prop in target || typeof prop !== "string") {
          return Reflect.get(target, prop, receiver);
        }

        // 시나리오 단계인 경우 동적 메서드로 처리
        if (target.hasStep(prop)) {
          return (params?: any) => {
            return target.executeStep(prop, params);
          };
        }

        // 정의되지 않은 속성
        return undefined;
      },
    });
  }

  get name(): string {
    return this.scenarioName;
  }

  get definition(): ScenarioDefinition {
    return { ...this.scenarioDefinition }; // 복사본 반환
  }

  private executeStep<T = any>(stepName: string, params?: T): any {
    if (!this.hasStep(stepName)) {
      const error = new Error(
        `Step '${stepName}' not found in scenario '${this.scenarioName}'`
      );
      logger.error(error.message, {
        availableSteps: this.getSteps(),
        requestedStep: stepName,
      });
      throw error;
    }

    try {
      this.executionOptions.onStepStart?.(stepName);
      logger.debug(
        `Executing step '${stepName}' in scenario '${this.scenarioName}'`
      );

      const stepFunction = this.scenarioDefinition[stepName];
      const result = stepFunction(params);

      // 동기 함수의 경우 즉시 완료 처리
      if (result instanceof Promise) {
        // 비동기 함수의 경우 Promise 체인으로 처리
        return result
          .then((finalResult) => {
            this.executionOptions.onStepEnd?.(stepName);
            logger.debug(
              `Step '${stepName}' completed in scenario '${this.scenarioName}'`
            );
            return finalResult;
          })
          .catch((error) => {
            const stepError =
              error instanceof Error ? error : new Error(String(error));
            this.executionOptions.onStepError?.(stepName, stepError);
            logger.error(
              `Step '${stepName}' failed in scenario '${this.scenarioName}'`,
              stepError
            );
            throw stepError;
          });
      } else {
        // 동기 함수의 경우
        this.executionOptions.onStepEnd?.(stepName);
        logger.debug(
          `Step '${stepName}' completed in scenario '${this.scenarioName}'`
        );
        return result;
      }
    } catch (error) {
      const stepError =
        error instanceof Error ? error : new Error(String(error));
      this.executionOptions.onStepError?.(stepName, stepError);

      logger.error(
        `Step '${stepName}' failed in scenario '${this.scenarioName}'`,
        {
          error: stepError.message,
          stack: stepError.stack,
        }
      );

      // step 메서드는 항상 에러를 던져야 함
      throw stepError;
    }
  }

  getSteps(): string[] {
    return Object.keys(this.scenarioDefinition);
  }

  hasStep(stepName: string): boolean {
    return stepName in this.scenarioDefinition;
  }

  clone(newName?: string): ScenarioInstance {
    const cloneName = newName || `${this.scenarioName}_clone_${Date.now()}`;
    return new ScenarioExecutor(
      cloneName,
      this.scenarioDefinition,
      this.executionOptions
    );
  }
}

/**
 * 전역 시나리오 레지스트리
 */
const scenarioRegistry = new Map<string, ScenarioExecutor>();

/**
 * 시나리오 팩토리 함수 - 동적 메서드 접근 지원
 */
export function createScenario<T extends ScenarioDefinition>(
  name: string,
  definition: T,
  options?: ScenarioExecutionOptions
): ExecutableScenario<T> {
  // 기존 시나리오가 있으면 경고하고 덮어쓰기
  if (scenarioRegistry.has(name)) {
    logger.warn(
      `Scenario '${name}' already exists, replacing with new definition`
    );
  }

  // 새 시나리오 생성
  const scenario = new ScenarioExecutor(name, definition, options);
  scenarioRegistry.set(name, scenario);

  logger.debug(
    `Scenario '${name}' registered with steps: ${scenario
      .getSteps()
      .join(", ")}`
  );
  return scenario as ExecutableScenario<T>;
}

/**
 * 등록된 시나리오 조회
 */
export function getScenario(name: string): ScenarioInstance | undefined {
  return scenarioRegistry.get(name);
}

/**
 * 모든 시나리오 정리
 */
export function clearAllScenarios(): void {
  const scenarioNames = Array.from(scenarioRegistry.keys());
  scenarioRegistry.clear();

  logger.debug("All scenarios cleared", {
    clearedScenarios: scenarioNames,
  });
}

/**
 * 등록된 시나리오 목록 조회
 */
export function getRegisteredScenarios(): string[] {
  return Array.from(scenarioRegistry.keys());
}

/**
 * 전체 시나리오 개수 조회
 */
export function getScenarioCount(): number {
  return scenarioRegistry.size;
}

/**
 * 재귀적 시나리오 팩토리 함수 - 시나리오 내에서 다른 단계를 호출할 수 있음
 */
export function createSeparatedScenario<
  C extends ScenarioDefinition,
  T extends Record<string, ScenarioImplementationFunction>
>(
  name: string,
  factory: ScenarioControllerFactory<C, T>,
  implementation: T
): ExecutableScenario<T> {
  // implementationProxy 객체를 생성 (controllerFactory에서 사용할 프록시 객체)
  const implementationProxy = {} as C;

  // implementation의 각 메서드를 implementationProxy에 연결
  Object.keys(implementation).forEach((stepName) => {
    (implementationProxy as any)[stepName] = async (params?: any) => {
      return implementation[stepName](params);
    };
  });

  // controllerFactory 함수를 호출하여 실제 정의를 얻음
  const definition = factory(implementationProxy);

  // controllerFactory가 반환한 정의로 시나리오 인스턴스 생성
  const scenarioInstance = createScenario(
    name,
    definition as ScenarioDefinition
  ) as ExecutableScenario<T>;

  logger.debug(
    `Separated scenario '${name}' created with steps: ${Object.keys(
      definition
    ).join(", ")}`
  );

  return scenarioInstance;
}
