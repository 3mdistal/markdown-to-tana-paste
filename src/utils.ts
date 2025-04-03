/**
 * Converts a Markdown string to Tana Paste format.
 * @param markdown The input Markdown string.
 * @returns The converted Tana Paste string.
 */
export function markdownToTanaPaste(markdown: string): string {
    const lines = markdown.split('\n');
    let tanaPaste = '%%tana%%\n';
    let outputLines: string[] = [];
    const headingLevelStack: number[] = []; // Tracks heading levels [1, 2]
    const listIndentStack: number[] = [];   // Tracks char positions for lists
    const spacePerIndent = 2;

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
        if (trimmedLine === '') return;

        // --- Determine current indentation context --- 
        const currentHeadingDepth = headingLevelStack.length; // How many levels deep are we in headings?
        const baseIndent = '  '.repeat(currentHeadingDepth); // Base indent string from headings

        // --- Handle Headings --- 
        const headingMatch = trimmedLine.match(/^(#+)\s+(.*)/);
        if (headingMatch) {
            const newHeadingLevel = headingMatch[1].length;
            const content = applyInlineFormatting(headingMatch[2]);

            // <<< Corrected Logic: Calculate indent *before* popping >>>
            let tempHeadingDepth = headingLevelStack.length;
            while (tempHeadingDepth > 0 && newHeadingLevel <= headingLevelStack[tempHeadingDepth - 1]) {
                tempHeadingDepth--;
            }
            const headingLineIndent = '  '.repeat(tempHeadingDepth);

            // Now, adjust the *actual* stack for subsequent lines
            while (headingLevelStack.length > 0 && newHeadingLevel <= headingLevelStack[headingLevelStack.length - 1]) {
                headingLevelStack.pop();
            }
            headingLevelStack.push(newHeadingLevel);
            listIndentStack.length = 0; // Reset list context

            outputLines.push(`${headingLineIndent}- !! ${content}`);
            return;
        }

        // --- Handle Lists --- 
        const listItemMatch = line.match(/^(\s*)(?:-|\*|[0-9]+\.)\s+(.*)/);
        if (listItemMatch) {
            const listCharIndent = listItemMatch[1].length;
            let content = listItemMatch[2];

            // --- List stack logic (determining relative indent level) ---
            // Pop levels shallower than the current item
            while (listIndentStack.length > 0 && listCharIndent < listIndentStack[listIndentStack.length - 1]) {
                listIndentStack.pop();
            }
            // Push if it represents a new, deeper indent level compared to the (new) top
            // We only consider it "deeper" if it's at least spacePerIndent more than the previous level
            if (listIndentStack.length === 0 || listCharIndent >= ((listIndentStack[listIndentStack.length - 1] || -spacePerIndent) + spacePerIndent)) {
                // Avoid pushing the same level again if the indent matches the current top
                if (listIndentStack.length === 0 || listCharIndent !== listIndentStack[listIndentStack.length - 1]) {
                    listIndentStack.push(listCharIndent);
                }
            }
            // If shallower or equal (and not significantly deeper), the stack is correct after popping.
            // --- End list stack logic ---

            const listRelativeIndentLevel = listIndentStack.length;
            // Additional indent based on relative level (depth 1 = 0 spaces, depth 2 = 2 spaces)
            const additionalListIndent = '  '.repeat(listRelativeIndentLevel > 0 ? listRelativeIndentLevel - 1 : 0);

            content = applyInlineFormatting(content);
            outputLines.push(`${baseIndent}${additionalListIndent}- ${content}`);
            return;
        }

        // --- Handle Paragraphs --- 
        listIndentStack.length = 0; // Reset list context
        const content = applyInlineFormatting(trimmedLine);
        outputLines.push(`${baseIndent}- ${content}`);
    });

    tanaPaste += outputLines.join('\n');
    return tanaPaste;
}
