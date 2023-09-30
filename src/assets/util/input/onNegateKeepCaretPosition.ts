/**
 * Use this function on numeric input masks if the caret of the input mask is changing position when the value of the input gets negated.
 *
 * @example createMask({ onBeforeWrite: onNegateKeepCaretPosition() })
 */
export function onNegateKeepCaretPosition(): (event: KeyboardEvent, buffer: string[], caretPos: number, opts: Inputmask.Options) => Inputmask.CommandObject {
    let lastCaretPos = -1

    const doNothing = {} as Inputmask.CommandObject

    return (event: KeyboardEvent, buffer: string[], caretPos: number, opts: Inputmask.Options): Inputmask.CommandObject => {
        debugger
        if (event.code !== 'NumpadSubtract' && event.code !== 'Slash') {
            return doNothing
        }

        const lastIndex = buffer.length - 1
        if (buffer[lastIndex] === '-') {
            lastCaretPos = caretPos

            return doNothing
        }

        if (lastCaretPos === -1) {
            const index = buffer.indexOf('.') + 1
            if (index !== -1) {
                lastCaretPos = index
            }
        }

        return {
            caret: lastCaretPos
        } as Inputmask.CommandObject
    }
}
