// Small helpers for reading Storyblok field values.
export type Asset = { filename?: string; alt?: string } | null | undefined;
export const src = (a: Asset) => (a && a.filename ? a.filename : undefined);
export const lines = (s?: string) => (s ?? '').split('\n').map(x => x.trim()).filter(Boolean);
export interface Blok { _uid: string; component: string; _editable?: string; [k: string]: any }
