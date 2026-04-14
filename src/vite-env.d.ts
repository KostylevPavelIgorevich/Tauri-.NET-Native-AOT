/// <reference types="vite/client" />

type TauriInvokeArgs = Record<string, unknown>;
type TauriInvoke = <T = string>(command: string, args?: TauriInvokeArgs) => Promise<T>;
type TauriUnlisten = () => void;
type TauriListen = (
  event: string,
  handler: (event: { payload: string }) => void
) => Promise<TauriUnlisten>;

interface Window {
  __TAURI__: {
    core: {
      invoke: TauriInvoke;
    };
    event: {
      listen: TauriListen;
    };
  };
}
