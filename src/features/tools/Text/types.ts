// EditorToolPanel/tools/Text/types.ts

export type TextType = "heading" | "body";

export interface TextStyle {
  fontFamily: string;
  fontWeight: string;
  fontSize: number;

  bold: boolean;
  underline: boolean;
  strike: boolean;

  fillColor: string;
  fillOpacity: number;

  backgroundColor: string;
  backgroundOpacity: number;
}

export interface TextLayer {
  id: string;

  type: TextType;
  content: string;

  startTime: number;   // seconds
  duration: number;    // seconds

  style: TextStyle;
}
