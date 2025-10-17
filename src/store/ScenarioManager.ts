import {
  DynamicScenario,
  GrunfeldScenario,
  RecursiveScenarioFactory,
  RecursiveScenarioStep,
  ScenarioDefinition,
  ScenarioOptions,
  SeparatedRecursiveFactory,
} from "../types";
import { logger } from "../utils/logger";

/**
 * 시나리오 워크플로우 관리를 위한 클래스
 */
class ScenarioManager implements GrunfeldScenario {
  private readonly scenarioName: string;
  private readonly scenarioDefinition: ScenarioDefinition;
  private readonly options: Required<ScenarioOptions>;

  constructor(
    name: string,
    definition: ScenarioDefinition,
    options: ScenarioOptions = {}
  ) {
    this.scenarioName = name;
    this.scenarioDefinition = { ...definition }; // 복사본 생성
    this.options = {
      stepDelay: options.stepDelay ?? 0,
      onStepStart: options.onStepStart ?? (() => {}),
      onStepEnd: options.onStepEnd ?? (() => {}),
      onStepError: options.onStepError ?? (() => {}),
    };

    logger.debug(
      `Scenario '${name}' created with ${this.getSteps().length} steps`,
      {
        steps: this.getSteps(),
        options: this.options,
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
          return async (params?: any) => {
            return target.step(prop, params);
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

  async step<T = any>(stepName: string, params?: T): Promise<void> {
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
      this.options.onStepStart?.(stepName);
      logger.debug(
        `Executing step '${stepName}' in scenario '${this.scenarioName}'`
      );

      const stepFunction = this.scenarioDefinition[stepName];
      await stepFunction(params);

      this.options.onStepEnd?.(stepName);
      logger.debug(
        `Step '${stepName}' completed in scenario '${this.scenarioName}'`
      );
    } catch (error) {
      const stepError =
        error instanceof Error ? error : new Error(String(error));
      this.options.onStepError?.(stepName, stepError);

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

  clone(newName?: string): GrunfeldScenario {
    const cloneName = newName || `${this.scenarioName}_clone_${Date.now()}`;
    return new ScenarioManager(
      cloneName,
      this.scenarioDefinition,
      this.options
    );
  }
}

/**
 * 전역 시나리오 레지스트리
 */
const scenarioRegistry = new Map<string, ScenarioManager>();

/**
 * 시나리오 팩토리 함수 - 동적 메서드 접근 지원
 */
export function createScenario<T extends ScenarioDefinition>(
  name: string,
  definition: T,
  options?: ScenarioOptions
): DynamicScenario<T> {
  // 기존 시나리오가 있으면 경고하고 덮어쓰기
  if (scenarioRegistry.has(name)) {
    logger.warn(
      `Scenario '${name}' already exists, replacing with new definition`
    );
  }

  // 새 시나리오 생성
  const scenario = new ScenarioManager(name, definition, options);
  scenarioRegistry.set(name, scenario);

  logger.debug(
    `Scenario '${name}' registered with steps: ${scenario
      .getSteps()
      .join(", ")}`
  );
  return scenario as DynamicScenario<T>;
}

/**
 * 등록된 시나리오 조회
 */
export function getScenario(name: string): GrunfeldScenario | undefined {
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
export function createRecursiveScenario<
  T extends Record<string, RecursiveScenarioStep>
>(
  name: string,
  factory: RecursiveScenarioFactory<T>,
  options?: ScenarioOptions
): DynamicScenario<T> {
  // 먼저 빈 프록시 객체를 생성
  const scenarioProxy = {} as {
    [K in keyof T]: (params?: Parameters<T[K]>[0]) => Promise<void>;
  };

  // factory 함수를 호출하여 정의를 얻음 (이 시점에서 proxy는 아직 비어있음)
  const definition = factory(scenarioProxy);

  // 실제 시나리오 인스턴스 생성
  const scenarioInstance = createScenario(
    name,
    definition as ScenarioDefinition,
    options
  ) as DynamicScenario<T>;

  // 이제 proxy에 실제 메서드들을 연결
  Object.keys(definition).forEach((stepName) => {
    (scenarioProxy as any)[stepName] = async (params?: any) => {
      return scenarioInstance.step(stepName, params);
    };
  });

  logger.debug(
    `Recursive scenario '${name}' created with steps: ${Object.keys(
      definition
    ).join(", ")}`
  );

  return scenarioInstance;
}

/**
 * 분리된 재귀적 시나리오 팩토리 함수 - 제어 로직과 구현을 분리
 */
export function createSeparatedRecursiveScenario<
  T extends Record<string, RecursiveScenarioStep>
>(
  name: string,
  controlFactory: SeparatedRecursiveFactory<T>,
  implementation: T,
  options?: ScenarioOptions
): DynamicScenario<T> {
  // 프록시 객체 생성
  const clicheProxy = {} as {
    [K in keyof T]: (params?: Parameters<T[K]>[0]) => Promise<void>;
  };

  // 제어 로직 실행 (일부 단계만 정의될 수 있음)
  const controlDefinition = controlFactory(clicheProxy);

  // 제어 로직과 구현을 병합 (제어 로직이 우선)
  const mergedDefinition = { ...implementation, ...controlDefinition } as T;

  // 실제 시나리오 생성
  const scenarioInstance = createScenario(
    name,
    mergedDefinition as ScenarioDefinition,
    options
  ) as DynamicScenario<T>;

  // 프록시에 실제 메서드들 연결
  Object.keys(mergedDefinition).forEach((stepName) => {
    (clicheProxy as any)[stepName] = async (params?: any) => {
      return scenarioInstance.step(stepName, params);
    };
  });

  logger.debug(
    `Separated recursive scenario '${name}' created with steps: ${Object.keys(
      mergedDefinition
    ).join(", ")}`
  );

  return scenarioInstance;
}
