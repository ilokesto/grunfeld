/**
 * 시나리오 단계 함수 타입
 * 각 단계에서 실행할 작업을 정의 (매개변수 선택적으로 받을 수 있음)
 */
export type ScenarioStep<T = any> = (params?: T) => void | Promise<void>;

/**
 * 시나리오 정의 - 각 단계별 작업을 객체로 정의
 */
export type ScenarioDefinition = Record<string, ScenarioStep>;

/**
 * 재귀적 시나리오를 위한 단계 함수 타입
 */
export type RecursiveScenarioStep<T = any> = (
  params?: T
) => void | Promise<void>;

/**
 * 재귀적 시나리오 팩토리 함수 타입
 */
export type RecursiveScenarioFactory<
  T extends Record<string, RecursiveScenarioStep>
> = (scenario: {
  [K in keyof T]: (params?: Parameters<T[K]>[0]) => Promise<void>;
}) => T;

/**
 * 분리된 재귀적 시나리오 팩토리 함수 타입 (새로운 방식)
 * 2번째 인자: 호출 로직, 3번째 인자: 실제 구현
 */
export type SeparatedRecursiveFactory<
  T extends Record<string, RecursiveScenarioStep>
> = (cliche: {
  [K in keyof T]: (params?: Parameters<T[K]>[0]) => Promise<void>;
}) => Partial<T>;

/**
 * 시나리오 인스턴스
 * 정의된 시나리오를 실행하고 관리하는 객체
 */
export interface GrunfeldScenario {
  /** 시나리오 이름 */
  readonly name: string;

  /** 시나리오 정의 */
  readonly definition: ScenarioDefinition;

  /** 특정 단계 실행 (매개변수 선택적 전달 가능) */
  step<T = any>(stepName: string, params?: T): Promise<void>;

  /** 사용 가능한 단계 목록 조회 */
  getSteps(): string[];

  /** 시나리오가 특정 단계를 가지고 있는지 확인 */
  hasStep(stepName: string): boolean;

  /** 시나리오 복제 (새로운 인스턴스 생성) */
  clone(newName?: string): GrunfeldScenario;
}

/**
 * 동적 메서드 접근을 위한 시나리오 타입
 * 각 단계를 메서드로 직접 호출할 수 있도록 함
 */
export type DynamicScenario<T extends ScenarioDefinition> = GrunfeldScenario & {
  [K in keyof T]: T[K] extends ScenarioStep<infer P>
    ? (params?: P) => Promise<void>
    : never;
};

/**
 * 시나리오 옵션
 */
export interface ScenarioOptions {
  /** 단계 간 지연 시간 (밀리초, 기본값: 0) */
  stepDelay?: number;

  /** 단계 실행 전후 콜백 */
  onStepStart?: (stepName: string) => void;
  onStepEnd?: (stepName: string) => void;
  onStepError?: (stepName: string, error: Error) => void;
}
