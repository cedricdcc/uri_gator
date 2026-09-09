import { describe, expect, test, afterEach } from 'bun:test';
import { parseCliArgs, getCliUsage } from './args';
import { runWrxCli } from './run';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

async function captureCliOutput(args: string[]): Promise<{ logs: string[]; errors: string[] }> {
  const logs: string[] = [];
  const errors: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;
  const originalStderrWrite = process.stderr.write;

  console.log = (...items: unknown[]) => {
    logs.push(items.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(' '));
  };
  console.error = (...items: unknown[]) => {
    errors.push(items.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(' '));
  };
  process.stderr.write = ((chunk: unknown) => {
    errors.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;

  try {
    await runWrxCli(args);
  } finally {
    console.log = originalLog;
    console.error = originalError;
    process.stderr.write = originalStderrWrite;
  }

  return { logs, errors };
}

describe('CLI Argument Parser', () => {
  test('parses -a as all flag', () => {
    const parsed = parseCliArgs(['-a', 'https://example.org/resource']);
    expect(parsed.all).toBe(true);
    expect(parsed.input).toBe('https://example.org/resource');
  });

  test('parses -p as provenance flag', () => {
    const parsed = parseCliArgs(['-p', 'https://example.org/resource']);
    expect(parsed.provenance).toBe(true);
    expect(parsed.input).toBe('https://example.org/resource');
  });

  test('parses -v as verbose flag', () => {
    const parsed = parseCliArgs(['-v', 'https://example.org/resource']);
    expect(parsed.verbose).toBe(true);
  });

  test('parses -o with file path', () => {
    const parsed = parseCliArgs(['-o', 'out.ttl', 'https://example.org/resource']);
    expect(parsed.output).toBe('out.ttl');
    expect(parsed.input).toBe('https://example.org/resource');
  });

  test('returns usage string for getCliUsage', () => {
    const usage = getCliUsage();
    expect(usage).toContain('Usage: bun run wrx.js');
    expect(usage).toContain('-a, --all');
    expect(usage).toContain('-p, --provenance');
  });
});

describe('CLI Runner Integration', () => {
  test('runs single-hit mode and prints RDF to stdout', async () => {
    const URI = 'https://cli.example.org/resource';
    const TURTLE = '@prefix ex: <https://example.org/> . ex:s ex:p ex:o .';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response(TURTLE, {
          status: 200,
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const { logs } = await captureCliOutput([URI]);
    expect(logs.join('\n')).toContain(TURTLE);
  });

  test('runs with -p and prints pure W3C PROV-O provenance as a single RDF stream', async () => {
    const URI = 'https://cli.example.org/prov-test';
    const TURTLE = '@prefix ex: <https://example.org/> . ex:s ex:p ex:o .';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response(TURTLE, {
          status: 200,
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const { logs } = await captureCliOutput(['-p', URI]);
    const output = logs.join('\n');
    expect(output).not.toContain('W3C PROV-O Provenance Graph');
    expect(output).toContain('@prefix prov: <http://www.w3.org/ns/prov#>');
    expect(output).toContain('prov:Entity');
    expect(output).toContain('https://example.org/s');
    expect(output).not.toContain('@prefix wrx:');
  });

  test('runs with -p and -o to write merged data and provenance triples to file', async () => {
    const URI = 'https://cli.example.org/prov-file-test';
    const TURTLE = '@prefix ex: <https://example.org/> . ex:s ex:p ex:o .';
    const outputFile = 'test-cli-prov-output.ttl';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response(TURTLE, {
          status: 200,
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    try {
      await captureCliOutput(['-p', '-o', outputFile, URI]);
      const fileContent = await Bun.file(outputFile).text();
      expect(fileContent).toContain('prov:Entity');
      expect(fileContent).toContain('prov:Activity');
      expect(fileContent).toContain('https://example.org/s');
    } finally {
      await Bun.file(outputFile).delete().catch(() => undefined);
    }
  });

  test('writes modeled link relations with rs:ln under openarchives.org/rs/terms/ to file', async () => {
    const URI = 'https://cli.example.org/links-test';
    const TURTLE = '@prefix ex: <https://example.org/> . ex:s ex:p ex:o .';
    const outputFile = 'test-cli-links-output.ttl';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response(TURTLE, {
          status: 200,
          headers: {
            'content-type': 'text/turtle',
            'link': '<https://cli.example.org/profile-1>; rel="profile"',
          },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    try {
      await captureCliOutput(['--extend-links', '-o', outputFile, URI]);
      const fileContent = await Bun.file(outputFile).text();
      expect(fileContent).toContain('rs:ln');
      expect(fileContent).toContain('rs:rel');
      expect(fileContent).toContain('rs:href');
      expect(fileContent).toContain(`<${URI}> rs:ln`);
      expect(fileContent).not.toContain('xhtml:link');
    } finally {
      await Bun.file(outputFile).delete().catch(() => undefined);
    }
  });

  test('runs with -a and executes exhaustive discovery', async () => {
    const URI = 'https://cli.example.org/all-test';
    const TURTLE = '@prefix ex: <https://example.org/> . ex:s ex:p ex:o .';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response(TURTLE, {
          status: 200,
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const { logs, errors } = await captureCliOutput(['-a', URI]);
    expect(errors.join('\n')).toContain('exhaustive mode');
    expect(logs.join('\n')).toContain(TURTLE);
  });
});
