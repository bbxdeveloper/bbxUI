/**
 * Use this function on numeric input masks if the caret of the input mask is changing position when the value of the input gets negated.
 *
 * @example createMask({ onBeforeWrite: onNegateKeepCaretPosition() })
 */
export function onNegateKeepCaretPosition(): (event: KeyboardEvent, buffer: string[], caretPos: number, opts: Inputmask.Options) => Inputmask.CommandObject {
    let lastCaretPos = 0

    const doNothing = {} as Inputmask.CommandObject

    return (event: KeyboardEvent, buffer: string[], caretPos: number, opts: Inputmask.Options): Inputmask.CommandObject => {
        if (event.code !== 'NumpadSubtract' && event.code !== 'Slash') {
            return doNothing
        }

        const lastIndex = buffer.length - 1
        if (buffer[lastIndex] === '-') {
            lastCaretPos = caretPos

            return doNothing
        }

        return {
            caret: lastCaretPos
        } as Inputmask.CommandObject
    }
}
