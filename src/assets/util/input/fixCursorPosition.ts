export function fixCursorPosition(event: FocusEvent): void {
    const input = event.target as HTMLInputElement
    const position = input.value.indexOf('.')
    input.selectionStart = 0
    input.selectionEnd = position
}
