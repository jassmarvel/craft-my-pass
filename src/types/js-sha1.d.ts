// src/types/js-sha1.d.ts
declare module 'js-sha1' {
  /**
   * Calculates the SHA-1 hash of a string or ArrayBuffer.
   * @param input The string or ArrayBuffer to hash.
   * @returns The SHA-1 hash as a hexadecimal string.
   */
  function sha1(input: string | ArrayBuffer): string;

  namespace sha1 {
    /**
     * Creates a SHA-1 hasher instance.
     * @returns A hasher object with update and hex methods.
     */
    function create(): {
      update(input: string | ArrayBuffer): any;
      hex(): string;
    };
  }

  export default sha1;
}