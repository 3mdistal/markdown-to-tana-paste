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

    it('should handle complex mixed bold/italic and punctuation edge cases', () => {
        const markdown = `## Executive superfunctions

So, here are some things I've noticed about myself over the years that, just from making so many fellow weirdo friends, seem to echo some of the Neurodiverse Experience™.

*(Please, take these as anecdotes. My only qualifications as a psychologist come from years of trying to win at competitive therapy.)*

**Creativity:** So, so, so often the lack of motivation I feel comes down to pervasive boredom. And to get around that boredom, I venture to places that most people never need to journey to. This gets labeled as "getting distracted" or sinking time into something that doesn't matter. That is, until we go *far* enough—then it's lauded as creative, out of the box thinking. For me, it's just breathing.

**Loose connections**: Maybe due to the above, my brain is much more likely to link seemingly disparate phenomena to create meaning. I tend to bring up things in conversations that others see as non-sequiturs, until I can reason my way back to the origin (which is the hard part), at which point I'm praised for finding a new approach to solve something.

**Tendency toward action:** Sure, choice paralysis is a blog in it of itself, and I often get stuck in indecision. But it tends to be about whether I should do the dishes or wipe the toilet first. And while that can be its own cute mental health crisis, when I'm faced with actual stakes—say, a bunch of people at work debating over the introduction of an article—I'm able to synthesize the information around me extremely quickly and come to a decision that folks are happy with. And usually, I've already implemented it by the time I'm asked to.

**Hyperfocus and root-cause analysis:** When I *do* get focused on a problem, I begin to approach it from all sides—I have this ability to analyze the fuck out of something, to tear it up if need be. My sister calls it "the busy big picture"—that state of flow where you see all the puzzle pieces of an entire system and can move them around without losing the photo on the cover.

**Improvisational strength:** I'm best when I'm in a brand new situation, making up answers on the fly, connecting things as fast as my brain can go. It's an adrenaline spike, sure, but it's also what I feel my brain is built for. Whatever the visible thing is in front of me, I'm ready for it. Unless it's a test of memory.

**Ethical reasoning:** Neurodiverse people go existential fast. When you physically don't derive pleasure from most tasks, you have to figure out *why* you're doing any given thing. I find a lot of my neurodiverse friends to be extremely conscious of the ins and outs of why they make the choices they do in their lives.

Anyway, just wanted to give a list of the flip side of the above. Hopefully, if you're reading this as a neurodiverse person, you already know these things about yourself and celebrate them as the rare strengths they are. And if you consider yourself neurotypical, think about how your strengths can complement neurodiversity to make better outcomes for... well, whatever it is you're doing.`;

        const expectedTanaPaste = `%%tana%%\n- !! Executive superfunctions\n- So, here are some things I've noticed about myself over the years that, just from making so many fellow weirdo friends, seem to echo some of the Neurodiverse Experience™.\n- __(Please, take these as anecdotes. My only qualifications as a psychologist come from years of trying to win at competitive therapy.)__\n- **Creativity:** So, so, so often the lack of motivation I feel comes down to pervasive boredom. And to get around that boredom, I venture to places that most people never need to journey to. This gets labeled as "getting distracted" or sinking time into something that doesn't matter. That is, until we go __far__ enough—then it's lauded as creative, out of the box thinking. For me, it's just breathing.\n- **Loose connections**: Maybe due to the above, my brain is much more likely to link seemingly disparate phenomena to create meaning. I tend to bring up things in conversations that others see as non-sequiturs, until I can reason my way back to the origin (which is the hard part), at which point I'm praised for finding a new approach to solve something.\n- **Tendency toward action:** Sure, choice paralysis is a blog in it of itself, and I often get stuck in indecision. But it tends to be about whether I should do the dishes or wipe the toilet first. And while that can be its own cute mental health crisis, when I'm faced with actual stakes—say, a bunch of people at work debating over the introduction of an article—I'm able to synthesize the information around me extremely quickly and come to a decision that folks are happy with. And usually, I've already implemented it by the time I'm asked to.\n- **Hyperfocus and root-cause analysis:** When I __do__ get focused on a problem, I begin to approach it from all sides—I have this ability to analyze the fuck out of something, to tear it up if need be. My sister calls it "the busy big picture"—that state of flow where you see all the puzzle pieces of an entire system and can move them around without losing the photo on the cover.\n- **Improvisational strength:** I'm best when I'm in a brand new situation, making up answers on the fly, connecting things as fast as my brain can go. It's an adrenaline spike, sure, but it's also what I feel my brain is built for. Whatever the visible thing is in front of me, I'm ready for it. Unless it's a test of memory.\n- **Ethical reasoning:** Neurodiverse people go existential fast. When you physically don't derive pleasure from most tasks, you have to figure out __why__ you're doing any given thing. I find a lot of my neurodiverse friends to be extremely conscious of the ins and outs of why they make the choices they do in their lives.\n- Anyway, just wanted to give a list of the flip side of the above. Hopefully, if you're reading this as a neurodiverse person, you already know these things about yourself and celebrate them as the rare strengths they are. And if you consider yourself neurotypical, think about how your strengths can complement neurodiversity to make better outcomes for... well, whatever it is you're doing.`;

        expect(markdownToTanaPaste(markdown)).toBe(expectedTanaPaste);
    });
}); 