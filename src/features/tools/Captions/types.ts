export type CaptionSection = "presets" | "font" | "effects";

export type Alignment = "left" | "center" | "right" | "justify";
export type TextCase = "none" | "uppercase" | "lowercase" | "capitalize";

export interface CaptionFontStyle {
  // Font settings
  fontFamily: string;
  fontWeight: string;
  fontSize: number;

  // Alignment
  alignment: Alignment;

  // Decoration
  bold: boolean;
  underline: boolean;
  strike: boolean;

  // Case
  case: TextCase;

  // Colors
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeOpacity: number;

  // Shadows
  shadowsEnabled: boolean;
  shadowColor: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
}

