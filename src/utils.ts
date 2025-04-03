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
        // 1. Normalize bold: __bold__ -> **bold**
        text = text.replace(/(?<!\*\*\*)(?:(^|\s|\()(__)(?=\S))(.+?)(?<=\S)\2(?![\*])(\s|$|\)|\.)/g, '$1**$3**$4');

        // 2. Convert italic *italic* or _italic_ -> __italic__
        //    Make sure not to match inside existing **...**
        text = text.replace(/(?<!\*\*)(?<![\*_])(?:(^|\s|\()([*_])(?=\S))(.+?)(?<=\S)\2(?![\*_])(?<!\*\*)(\s|$|\)|\.)/g, '$1__$3__$4');

        // 3. Ensure final bold is **bold** (handles original **bold**)
        //    This might re-process, but ensures the final state is correct.
        text = text.replace(/(?<!\*\*\*\*|\*\*)(?:(^|\s|\()(\*\*))(?=\S)(.+?)(?<=\S)\2(?![\*])(\s|$|\)|\.)/g, '$1**$3**$4');

        return text;
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
