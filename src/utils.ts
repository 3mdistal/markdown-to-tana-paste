/**
 * Converts a Markdown string to Tana Paste format.
 * @param markdown The input Markdown string.
 * @returns The converted Tana Paste string.
 */
export function markdownToTanaPaste(markdown: string): string {
    const lines = markdown.split('\n');
    let tanaPaste = '%%tana%%\n';
    let outputLines: string[] = [];
    const listIndentStack: number[] = []; // Stack tracks character count of list markers' start
    const spacePerIndent = 2; // Assume 2 spaces per indent level

    function applyInlineFormatting(text: string): string {
        let result = '';
        let i = 0;
        const len = text.length;

        while (i < len) {
            // Check for ** or __ (Bold)
            if ((text.startsWith('**', i) || text.startsWith('__', i)) && text[i + 2] && text[i + 2].trim() !== '') {
                const marker = text.substring(i, i + 2);
                const endMarkerIndex = text.indexOf(marker, i + 2);
                if (endMarkerIndex > i + 1) {
                    // Ensure it's a valid closing marker (not preceded by space, followed by space/end/punctuation)
                    const lookAhead = text[endMarkerIndex + 2] === undefined || text[endMarkerIndex + 2].match(/\s|[.,!?;:)]|$/);
                    const lookBehind = text[endMarkerIndex - 1] && text[endMarkerIndex - 1].trim() !== '';
                    if (lookAhead && lookBehind) {
                        result += '**' + applyInlineFormatting(text.substring(i + 2, endMarkerIndex)) + '**';
                        i = endMarkerIndex + 2;
                        continue;
                    }
                }
            }

            // Check for * or _ (Italic)
            if ((text[i] === '*' || text[i] === '_') && text[i + 1] && text[i + 1].trim() !== '') {
                const marker = text[i];
                // Avoid matching ** or __ as italic
                if (text[i + 1] === marker) {
                    result += text.substring(i, i + 2);
                    i += 2;
                    continue;
                }

                const endMarkerIndex = text.indexOf(marker, i + 1);
                // Ensure it's not consuming part of a bold marker if same char
                if (endMarkerIndex > i && text[endMarkerIndex + 1] !== marker && text[endMarkerIndex - 1] !== marker) {
                    // Ensure it's a valid closing marker
                    const lookAhead = text[endMarkerIndex + 1] === undefined || text[endMarkerIndex + 1].match(/\s|[.,!?;:)]|$/);
                    const lookBehind = text[endMarkerIndex - 1] && text[endMarkerIndex - 1].trim() !== '';

                    if (lookAhead && lookBehind) {
                        result += '__' + applyInlineFormatting(text.substring(i + 1, endMarkerIndex)) + '__';
                        i = endMarkerIndex + 1;
                        continue;
                    }
                }
            }

            // No formatting marker found at this position, just append the character
            result += text[i];
            i++;
        }
        return result;
    }

    lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Skip empty lines
        if (trimmedLine === '') return;

        // Handle Headings
        const headingMatch = trimmedLine.match(/^(#+)\s+(.*)/);
        if (headingMatch) {
            listIndentStack.length = 0; // Headings reset list indentation
            const content = applyInlineFormatting(headingMatch[2]);
            outputLines.push(`- !! ${content}`);
            return;
        }

        // Handle Lists (Unordered and Ordered)
        const listItemMatch = line.match(/^(\s*)(?:-|\*|[0-9]+\.)\s+(.*)/);
        if (listItemMatch) {
            const charIndent = listItemMatch[1].length; // Actual character indent from line start
            let content = listItemMatch[2];
            let currentTanaLevel = 0;

            // Adjust stack based on character indent
            while (listIndentStack.length > 0 && charIndent < listIndentStack[listIndentStack.length - 1]) {
                listIndentStack.pop();
            }

            // If it's a new, deeper indent level
            if (listIndentStack.length === 0 || charIndent > listIndentStack[listIndentStack.length - 1]) {
                // Simple check: only push if it's reasonably deeper than the previous level
                if (listIndentStack.length === 0 || charIndent >= (listIndentStack[listIndentStack.length - 1] + spacePerIndent - 1)) {
                    listIndentStack.push(charIndent);
                }
                // If not significantly deeper, treat as same level as parent
            }
            // If charIndent matches an existing level in the stack (e.g. de-indenting)
            else if (listIndentStack.includes(charIndent)) {
                while (listIndentStack.length > 0 && listIndentStack[listIndentStack.length - 1] !== charIndent) {
                    listIndentStack.pop();
                }
            }
            // else: charIndent is same as top, or shallower but not matching an existing level (potentially inconsistent MD)
            // In these cases, the stack top remains the reference point.

            currentTanaLevel = listIndentStack.length; // Tana level is the depth of the stack

            const indentString = '  '.repeat(currentTanaLevel > 0 ? currentTanaLevel - 1 : 0); // Tana level 1 = 0 spaces, level 2 = 2 spaces etc.
            content = applyInlineFormatting(content);
            outputLines.push(`${indentString}- ${content}`);
            return;
        }

        // Handle Paragraphs (treat as top-level nodes)
        listIndentStack.length = 0; // Non-list items reset list indentation
        const content = applyInlineFormatting(trimmedLine);
        outputLines.push(`- ${content}`);
    });

    tanaPaste += outputLines.join('\n');
    return tanaPaste;
}
