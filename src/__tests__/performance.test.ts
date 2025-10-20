/**
 * 성능 벤치마크 테스트
 * 스토어 업데이트 및 시나리오 실행 성능을 측정
 */

describe("Performance Benchmarks", () => {
  let testStore: ReturnType<typeof createTestStore>;

  // 테스트용 스토어 생성 함수 (GrunfeldStore의 내부 로직 재사용)
  function createTestStore() {
    const subscribers = new Set<() => void>();
    let dialogStore: Array<any> = [];

    const notifySubscribers = () => {
      if (subscribers.size === 0) return;
      subscribers.forEach((subscriber) => subscriber());
    };

    return {
      add(dialogFactory: () => any) {
        const props = dialogFactory();
        dialogStore.push(props);
        notifySubscribers();
      },
      remove() {
        dialogStore.pop();
        notifySubscribers();
      },
      clear() {
        dialogStore = [];
        notifySubscribers();
      },
      getStore: () => dialogStore,
      subscribe(subscriber: () => void) {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
    };
  }

  beforeEach(() => {
    testStore = createTestStore();
  });

  it("should handle rapid dialog additions efficiently", () => {
    const iterations = 100;
    const startTime = performance.now();

    // 100개의 다이얼로그를 빠르게 추가
    for (let i = 0; i < iterations; i++) {
      testStore.add(() => ({
        element: `Dialog ${i}`,
        position: "center",
        lightDismiss: true,
      }));
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 100개의 다이얼로그 추가가 100ms 이내에 완료되어야 함
    expect(duration).toBeLessThan(100);
    expect(testStore.getStore().length).toBe(iterations);

    console.log(`✓ Added ${iterations} dialogs in ${duration.toFixed(2)}ms`);
  });

  it("should handle rapid remove operations efficiently", () => {
    // 50개의 다이얼로그 추가
    for (let i = 0; i < 50; i++) {
      testStore.add(() => ({
        element: `Dialog ${i}`,
        position: "center",
      }));
    }

    const startTime = performance.now();

    // 모두 제거
    for (let i = 0; i < 50; i++) {
      testStore.remove();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 50개 제거가 50ms 이내에 완료되어야 함
    expect(duration).toBeLessThan(50);
    expect(testStore.getStore().length).toBe(0);

    console.log(`✓ Removed 50 dialogs in ${duration.toFixed(2)}ms`);
  });

  it("should handle clear operation efficiently with many dialogs", () => {
    // 100개의 다이얼로그 추가
    for (let i = 0; i < 100; i++) {
      testStore.add(() => ({
        element: `Dialog ${i}`,
        position: "center",
      }));
    }

    const startTime = performance.now();
    testStore.clear();
    const endTime = performance.now();

    const duration = endTime - startTime;

    // clear가 20ms 이내에 완료되어야 함
    expect(duration).toBeLessThan(20);
    expect(testStore.getStore().length).toBe(0);

    console.log(`✓ Cleared 100 dialogs in ${duration.toFixed(2)}ms`);
  });

  it("should handle store subscriptions efficiently", () => {
    const subscribers: Array<() => void> = [];
    const subscriptionCount = 50;

    const startTime = performance.now();

    // 50개의 구독자 추가
    for (let i = 0; i < subscriptionCount; i++) {
      const unsubscribe = testStore.subscribe(() => {
        // 빈 구독자
      });
      subscribers.push(unsubscribe);
    }

    // 다이얼로그 추가하여 모든 구독자에게 알림
    testStore.add(() => ({
      element: "Test",
      position: "center",
    }));

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 50개 구독자 추가 + 알림이 50ms 이내에 완료되어야 함
    expect(duration).toBeLessThan(50);

    // 구독 해제
    subscribers.forEach((unsubscribe) => unsubscribe());

    console.log(
      `✓ Added ${subscriptionCount} subscribers and notified in ${duration.toFixed(
        2
      )}ms`
    );
  });

  it("should optimize notification skipping when no subscribers", () => {
    const iterations = 1000;

    const startTime = performance.now();

    // 구독자가 없는 상태에서 1000번 업데이트
    for (let i = 0; i < iterations; i++) {
      testStore.add(() => ({
        element: `Dialog ${i}`,
        position: "center",
      }));
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 구독자가 없으면 알림 오버헤드가 없어야 하므로 매우 빨라야 함
    expect(duration).toBeLessThan(200);

    console.log(
      `✓ ${iterations} updates with no subscribers in ${duration.toFixed(2)}ms`
    );
  });

  it("should handle batch operations efficiently", () => {
    const batchSize = 20;
    const batchCount = 5;

    const startTime = performance.now();

    for (let batch = 0; batch < batchCount; batch++) {
      // 각 배치에서 여러 작업 수행
      for (let i = 0; i < batchSize; i++) {
        testStore.add(() => ({
          element: `Batch ${batch} Dialog ${i}`,
          position: "center",
        }));
      }

      // 일부 제거
      for (let i = 0; i < batchSize / 2; i++) {
        testStore.remove();
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const totalOps = batchCount * batchSize + batchCount * (batchSize / 2);
    const expectedRemaining = batchCount * (batchSize / 2); // 각 배치당 10개씩 남음
    expect(duration).toBeLessThan(100);
    expect(testStore.getStore().length).toBe(expectedRemaining);

    console.log(`✓ ${totalOps} batch operations in ${duration.toFixed(2)}ms`);
  });

  it("should measure memory efficiency with large stores", () => {
    const largeStoreSize = 500;

    // 메모리 측정 (approximate) - Chrome에서만 사용 가능
    const perfMemory = (performance as any).memory;
    const before = perfMemory ? perfMemory.usedJSHeapSize : 0;

    for (let i = 0; i < largeStoreSize; i++) {
      testStore.add(() => ({
        element: `Large Store Dialog ${i}`,
        position: "center",
        lightDismiss: true,
        data: { index: i, metadata: `test-${i}` },
      }));
    }

    const after = perfMemory ? perfMemory.usedJSHeapSize : 0;
    const memoryDelta = after - before;

    expect(testStore.getStore().length).toBe(largeStoreSize);

    if (memoryDelta > 0) {
      const avgMemoryPerDialog = memoryDelta / largeStoreSize;
      console.log(
        `✓ Average memory per dialog: ${(avgMemoryPerDialog / 1024).toFixed(
          2
        )}KB`
      );
    } else {
      console.log(`✓ Created ${largeStoreSize} dialogs successfully`);
    }
  });

  it("should benchmark subscription notification overhead", () => {
    const updateCount = 100;
    const subscriberCounts = [0, 10, 50, 100];
    const results: { [key: number]: number } = {};

    subscriberCounts.forEach((count) => {
      const store = createTestStore();
      const unsubscribers: Array<() => void> = [];

      // 구독자 추가
      for (let i = 0; i < count; i++) {
        unsubscribers.push(store.subscribe(() => {}));
      }

      const startTime = performance.now();

      // 업데이트 수행
      for (let i = 0; i < updateCount; i++) {
        store.add(() => ({ element: `Test ${i}` }));
      }

      const endTime = performance.now();
      results[count] = endTime - startTime;

      // 구독 해제
      unsubscribers.forEach((unsub) => unsub());
    });

    console.log("✓ Notification overhead benchmark:");
    Object.entries(results).forEach(([subscriberCount, duration]) => {
      console.log(
        `  ${subscriberCount} subscribers: ${duration.toFixed(
          2
        )}ms for ${updateCount} updates`
      );
    });

    // 구독자가 많아도 성능이 극단적으로 저하되지 않아야 함
    expect(results[100]).toBeLessThan(200);
  });
});
