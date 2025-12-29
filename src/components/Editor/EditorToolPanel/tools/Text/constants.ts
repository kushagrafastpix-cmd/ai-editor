// EditorToolPanel/tools/Text/constants.ts

import type { TextStyle, TextType } from "./types";

export const DEFAULT_TEXT_DURATION = 2.5; // seconds

export const DEFAULT_TEXT_CONTENT: Record<TextType, string> = {
  heading: "Heading",
  body: "Body text",
};

export const DEFAULT_TEXT_STYLE: Record<TextType, TextStyle> = {
  heading: {
    fontFamily: "Inter",
    fontWeight: "Semibold",
    fontSize: 40,

    bold: false,
    underline: false,
    strike: false,

    fillColor: "#000000",
    fillOpacity: 100,

    backgroundColor: "#000000",
    backgroundOpacity: 0,
  },

  body: {
    fontFamily: "Inter",
    fontWeight: "Regular",
    fontSize: 24,

    bold: false,
    underline: false,
    strike: false,

    fillColor: "#000000",
    fillOpacity: 100,

    backgroundColor: "#000000",
    backgroundOpacity: 0,
  },
};
