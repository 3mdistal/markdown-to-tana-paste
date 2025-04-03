"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const utils_1 = require("./utils");
async function Command() {
    try {
        const clipboardText = await api_1.Clipboard.readText();
        if (!clipboardText || clipboardText.trim().length === 0) {
            await (0, api_1.showToast)({
                style: api_1.Toast.Style.Failure,
                title: "Clipboard is empty",
                message: "Please copy some Markdown text first.",
            });
            return;
        }
        await (0, api_1.showToast)({
            style: api_1.Toast.Style.Animated,
            title: "Converting...",
        });
        const tanaPasteResult = (0, utils_1.markdownToTanaPaste)(clipboardText);
        await api_1.Clipboard.paste(tanaPasteResult);
        await (0, api_1.showToast)({
            style: api_1.Toast.Style.Success,
            title: "Converted to Tana Paste",
            message: "Pasted to your clipboard.",
        });
        // No view commands should close immediately
        await (0, api_1.closeMainWindow)();
    }
    catch (error) {
        console.error("Conversion failed", error);
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        else if (typeof error === 'string') {
            errorMessage = error;
        }
        await (0, api_1.showToast)({
            style: api_1.Toast.Style.Failure,
            title: "Conversion Failed",
            message: errorMessage,
        });
    }
}
exports.default = Command;
