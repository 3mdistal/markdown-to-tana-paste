import { markdownToTanaPaste } from '../utils'; // Assuming utils.ts will hold our function

describe('markdownToTanaPaste', () => {
    it('should prepend %%tana%% to the output', () => {
        const markdown = 'Hello';
        const expectedTanaPaste = '%%tana%%\n- Hello';
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should convert markdown headings to Tana headings with correct indentation', () => {
        const markdown = '# Heading 1\n## Heading 2\n### Heading 3\n Text under H3';
        // Note: Tana Paste itself doesn't automatically indent content under headings unless it's a list.
        // The primary conversion is the `!!` marker.
        // Deeper headings might just become standard nodes unless part of a list structure.
        // Adjusting expectation for simpler heading conversion as per Tana docs.
        const expectedTanaPaste = '%%tana%%\n- !! Heading 1\n- !! Heading 2\n- !! Heading 3\n- Text under H3';
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should convert unordered lists with correct indentation', () => {
        const markdown = '- Item 1\n  - Item 1.1\n    - Item 1.1.1\n- Item 2';
        const expectedTanaPaste = '%%tana%%\n- Item 1\n  - Item 1.1\n    - Item 1.1.1\n- Item 2'; // Correct Tana format
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should convert ordered lists with correct indentation', () => {
        const markdown = '1. Item 1\n   1. Item 1.1\n      1. Item 1.1.1\n2. Item 2';
        const expectedTanaPaste = '%%tana%%\n- Item 1\n  - Item 1.1\n    - Item 1.1.1\n- Item 2'; // Correct Tana format (treats as unordered)
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should convert links', () => {
        const markdown = '[Tana Website](https://tana.inc)';
        const expectedTanaPaste = '%%tana%%\n- [Tana Website](https://tana.inc)';
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should convert bold text correctly', () => {
        const markdown = 'Some **bold** and __more bold__ text';
        const expectedTanaPaste = '%%tana%%\n- Some **bold** and **more bold** text'; // Tana uses **bold**
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should convert italic text correctly', () => {
        const markdown = 'Some *italic* and _more italic_ text';
        const expectedTanaPaste = '%%tana%%\n- Some __italic__ and __more italic__ text'; // Tana uses __italic__
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should handle bold and italic together', () => {
        const markdown = 'Mix _italic_ and **bold** text';
        const expectedTanaPaste = '%%tana%%\n- Mix __italic__ and **bold** text';
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should handle mixed content', () => {
        const markdown =
            `# My List

- Item 1 with [a link](http://example.com)
- Item 2 with **bold** text
  - Sub-item with _italic_`;
        const expectedTanaPaste =
            `%%tana%%
- !! My List
- Item 1 with [a link](http://example.com)
- Item 2 with **bold** text
  - Sub-item with __italic__`; // Adjusted expectation
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });

    it('should handle paragraphs as simple nodes', () => {
        const markdown = 'This is paragraph 1.\n\nThis is paragraph 2.';
        const expectedTanaPaste = '%%tana%%\n- This is paragraph 1.\n- This is paragraph 2.';
        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });
}); 