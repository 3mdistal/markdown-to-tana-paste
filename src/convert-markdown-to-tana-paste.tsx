import { Clipboard, closeMainWindow, showToast, Toast } from "@raycast/api";
import { markdownToTanaPaste } from "./utils";

export default async function Command() {
  try {
    const clipboardText = await Clipboard.readText();

    if (!clipboardText || clipboardText.trim().length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Clipboard is empty",
        message: "Please copy some Markdown text first.",
      });
      return;
    }

    await showToast({
      style: Toast.Style.Animated,
      title: "Converting...",
    });

    const tanaPasteResult = markdownToTanaPaste(clipboardText);

    await Clipboard.paste(tanaPasteResult);

    await showToast({
      style: Toast.Style.Success,
      title: "Converted to Tana Paste",
      message: "Pasted to your clipboard.",
    });

    // No view commands should close immediately
    await closeMainWindow();
  } catch (error) {
    console.error("Conversion failed", error);
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    await showToast({
      style: Toast.Style.Failure,
      title: "Conversion Failed",
      message: errorMessage,
    });
  }
}
