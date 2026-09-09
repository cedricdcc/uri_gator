declare module 'n3' {
  export const DataFactory: any;
  export class Parser {
    constructor(options?: any);
    parse(input: string, callback?: (error: unknown, quad?: any) => void): any[];
  }
  export class Writer {
    constructor(options?: any);
    addQuad(quad: any): void;
    addQuads(quads: any[]): void;
    end(callback: (error: unknown, result?: string) => void): void;
  }
  export class Store {
    constructor();
    addQuad(quad: any): void;
    addQuads(quads: any[]): void;
    getQuads(subject: any, predicate: any, object: any, graph: any): any[];
    size: number;
  }
  export interface Quad {
    subject: { value: string; termType: string };
    predicate: { value: string; termType: string };
    object: { value: string; termType: string; datatype?: { value: string }; language?: string };
    graph: { value: string };
  }
}

declare module 'jsonld' {
  const jsonld: any;
  export default jsonld;
}
