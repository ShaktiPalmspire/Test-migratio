/// <reference types="jest" />

declare global {
  const jest: {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => jest.MockedFunction<T>;
    mock: (moduleName: string, factory?: () => any) => void;
    unmock: (moduleName: string) => void;
    resetModules: () => void;
    clearAllMocks: () => void;
    clearAllTimers: () => void;
    useFakeTimers: () => void;
    useRealTimers: () => void;
    runAllTimers: () => void;
    runOnlyPendingTimers: () => void;
    advanceTimersByTime: (msToRun: number) => void;
    advanceTimersToNextTimer: () => void;
  };

  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}

export {}
