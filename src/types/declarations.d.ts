declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: Buffer | ArrayBuffer | Uint8Array;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }
  function convert(options: ConvertOptions): Promise<ArrayBuffer>;
  export default convert;
}

declare module 'libreoffice-convert' {
  export function convert(
    document: Buffer,
    format: string,
    filter: any,
    callback: (err: Error | null, done: Buffer) => void
  ): void;
}
