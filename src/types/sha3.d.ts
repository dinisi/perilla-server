declare module "sha3" {
    class SHA3Hash {
        constructor(hashlen?: number);
        update(data: string | Buffer, encoding?: 'ascii' | 'binary'): void;
        digest(encoding?: 'hex' | 'binary'): string;
    }
}