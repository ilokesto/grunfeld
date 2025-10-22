/**
 * Grunfeld 시나리오 타입 정의
 *
 * 지원되는 API 패턴:
 * 1. 기본 객체 방식: grunfeld.scenario(name, definition)
 * 2. 분리된 방식: grunfeld.scenario(name, controllerFactory, implementation)
 */

/**
 * 시나리오 단계 함수 타입
 * 각 단계에서 실행할 작업을 정의 (매개변수 선택적으로 받을 수 있음)
 */
export type ScenarioStepFunction<TParams = any, TReturn = any> = (
  params?: TParams
) => TReturn;

/**
 * 시나리오 정의 - 각 단계별 작업을 객체로 정의
 * 기본 객체 방식에서 사용: { step1: () => {}, step2: () => {} }
 * 모든 함수 시그니처를 허용 (required/optional params 모두 지원)
 */
export type ScenarioDefinition = Record<string, (...args: any[]) => any>;

/**
 * 분리된 시나리오의 구현 단계 함수 타입
 * 분리된 방식의 implementation에서 사용
 */
export type ScenarioImplementationFunction<TParams = any, TReturn = any> = (
  params?: TParams
) => TReturn;

/**
 * 분리된 시나리오 컨트롤러 팩토리 함수 타입
 *
 * 분리된 방식: grunfeld.scenario(name, controllerFactory, implementation)
 * - controllerFactory: 제어 로직을 정의하는 함수
 * - implementation: 실제 구현을 담은 객체
 * - implementationProxy: implementation의 메서드들을 가리키는 프록시 객체
 *
 * @param implementationProxy implementation의 메서드들에 대한 프록시
 * @returns 실제로 노출될 시나리오 메서드들
 */
export type ScenarioControllerFactory<
  TImplementation extends ScenarioDefinition,
  TController extends Record<string, ScenarioImplementationFunction<any, any>>
> = (implementationProxy: TImplementation) => TController;

/**
 * 시나리오 인스턴스 인터페이스
 * 정의된 시나리오를 실행하고 관리하는 객체
 */
export interface ScenarioInstance {
  /** 시나리오 이름 */
  readonly name: string;

  /** 시나리오 정의 */
  readonly definition: ScenarioDefinition;

  /** 사용 가능한 단계 목록 조회 */
  getSteps(): string[];

  /** 시나리오가 특정 단계를 가지고 있는지 확인 */
  hasStep(stepName: string): boolean;

  /** 시나리오 복제 (새로운 인스턴스 생성) */
  clone(newName?: string): ScenarioInstance;
}

/**
 * 실행 가능한 시나리오 타입
 * 각 단계를 메서드로 직접 호출할 수 있도록 함
 * 원래 함수가 동기면 동기로, 비동기면 비동기로 반환 타입 유지
 */
export type ExecutableScenario<TDefinition extends ScenarioDefinition> =
  ScenarioInstance & {
    [K in keyof TDefinition]: TDefinition[K] extends (
      ...args: infer Args
    ) => infer R
      ? (...args: Args) => R
      : never;
  };

/**
 * 시나리오 실행 옵션
 */
export interface ScenarioExecutionOptions {
  /** 단계 간 지연 시간 (밀리초, 기본값: 0) */
  stepDelay?: number;

  /** 단계 실행 전후 콜백 */
  onStepStart?: (stepName: string) => void;
  onStepEnd?: (stepName: string) => void;
  onStepError?: (stepName: string, error: Error) => void;
}
