import { GrunfeldStore } from "../store/GrunfeldStore";

describe("GrunfeldStore", () => {
  beforeEach(() => {
    GrunfeldStore.clear();
  });

  describe("add", () => {
    it("should add dialog to store", () => {
      const dialog = { element: "Test dialog" };

      GrunfeldStore.add(dialog);

      const store = GrunfeldStore.getStore();
      expect(store).toHaveLength(1);
      expect(store[0]).toEqual(dialog);
    });

    it("should prevent duplicate dialogs", () => {
      const dialog = { element: "Test dialog", position: "center" as const };

      GrunfeldStore.add(dialog);
      GrunfeldStore.add(dialog); // Same dialog

      const store = GrunfeldStore.getStore();
      expect(store).toHaveLength(1);
    });
  });

  describe("remove", () => {
    it("should remove last dialog from store", () => {
      const dialog1 = { element: "Dialog 1" };
      const dialog2 = { element: "Dialog 2" };

      GrunfeldStore.add(dialog1);
      GrunfeldStore.add(dialog2);

      expect(GrunfeldStore.getStore()).toHaveLength(2);

      GrunfeldStore.remove();

      expect(GrunfeldStore.getStore()).toHaveLength(1);
      expect(GrunfeldStore.getStore()[0]).toEqual(dialog1);
    });

    it("should call dismiss callback when removing dialog", () => {
      const dismissCallback = jest.fn();
      const dialog = {
        element: "Test dialog",
        dismissCallback,
      };

      GrunfeldStore.add(dialog);
      GrunfeldStore.remove();

      expect(dismissCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("clear", () => {
    it("should remove all dialogs from store", () => {
      GrunfeldStore.add({ element: "Dialog 1" });
      GrunfeldStore.add({ element: "Dialog 2" });
      GrunfeldStore.add({ element: "Dialog 3" });

      expect(GrunfeldStore.getStore()).toHaveLength(3);

      GrunfeldStore.clear();

      expect(GrunfeldStore.getStore()).toHaveLength(0);
    });
  });

  describe("subscribe", () => {
    it("should notify subscribers when store changes", () => {
      const callback = jest.fn();

      const unsubscribe = GrunfeldStore.subscribe(callback);

      GrunfeldStore.add({ element: "Test dialog" });

      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    it("should not notify unsubscribed callbacks", () => {
      const callback = jest.fn();

      const unsubscribe = GrunfeldStore.subscribe(callback);
      unsubscribe();

      GrunfeldStore.add({ element: "Test dialog" });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("addAsync", () => {
    it("should resolve with provided data when removeWith is called", async () => {
      const testData = { success: true };

      const promise = GrunfeldStore.addAsync((removeWith) => {
        setTimeout(() => removeWith(testData), 100);
        return { element: "Async dialog" };
      });

      const result = await promise;

      expect(result).toEqual(testData);
      expect(GrunfeldStore.getStore()).toHaveLength(0); // Should be removed
    });
  });
});
