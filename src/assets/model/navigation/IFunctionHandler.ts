import { KeyBindings } from "src/assets/util/KeyBindings";

export interface IFunctionHandler {
    HandleFunctionKey(event: Event | KeyBindings): void;
    isDeleteDisabled: boolean;
}