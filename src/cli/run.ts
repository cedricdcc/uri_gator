import type { ExtractedRDF, LinkRelationObservation, RDFOverview } from '../core/types';
import { collectLinkRelationsForUri } from './link-relations';
import { extractAllRDF, extractRDF, setLogLevel } from '../../wrx.ts';
import { logger } from '../core/logger';
import { getCliUsage, parseCliArgs } from './args';
import { serializeMergedRdf, writeMergedRdfOutput, writeRdfOutput } from './output';

function escapeLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function isAbsoluteUri(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
}

function renderRelForTurtle(rel: string): string {
  return isAbsoluteUri(rel) ? `<${rel}>` : `"${escapeLiteral(rel)}"`;
}

function renderLinkRelationsJson(relations: LinkRelationObservation[]): string {
  return JSON.stringify(
    relations.map((rel) => ({
      anchor: rel.anchor,
      rel: rel.rel,
      href: rel.href,
      origin: rel.origin,
      options: rel.options,
    })),
    null,
    2
  );
}

function renderLinkRelationsTurtle(relations: LinkRelationObservation[]): string {
  const lines: string[] = ['@prefix rs: <http://www.openarchives.org/rs/terms/>.', ''];
  for (const rel of relations) {
    const anchor = rel.anchor ?? rel.href;
    lines.push(`<${anchor}> rs:ln [`);
    lines.push('   a rs:ln;');
    lines.push(`   rs:rel ${renderRelForTurtle(rel.rel)};`);
    lines.push(`   rs:href <${rel.href}>;`);
    if (rel.title) {
      lines.push(`   rs:title "${escapeLiteral(rel.title)}";`);
    }
    if (rel.hreflang) {
      lines.push(`   rs:hreflang "${escapeLiteral(rel.hreflang)}";`);
    }
    if (rel.media) {
      lines.push(`   rs:media "${escapeLiteral(rel.media)}";`);
    }
    for (const opt of rel.options ?? []) {
      const optName = (opt.name ?? '').trim();
      const optVal = (opt.value ?? '').trim();
      if (!optName) continue;
      if (optName.toLowerCase() === 'profile' && isAbsoluteUri(optVal)) {
        lines.push(`   rs:profile <${optVal}>;`);
      } else {
        lines.push(`   rs:${optName} "${escapeLiteral(optVal)}";`);
      }
    }
    lines[lines.length - 1] = lines[lines.length - 1].replace(/;$/, '');
    lines.push('].');
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function collectProfileValues(relations: LinkRelationObservation[]): string[] {
  const profiles = new Set<string>();
  for (const relation of relations) {
    if (relation.rel === 'profile') {
      profiles.add(relation.href);
    }
    for (const option of relation.options ?? []) {
      const optionName = (option.name ?? '').toLowerCase();
      const optionValue = (option.value ?? '').trim();
      if (optionName === 'profile' && optionValue) {
        profiles.add(optionValue);
      }
    }
  }
  return [...profiles];
}

function printHelp(): void {
  console.log(getCliUsage());
}

function selectPrimaryRdf(overview: RDFOverview & { found?: ExtractedRDF[] }): ExtractedRDF | null {
  return overview.found?.[0] ?? null;
}

async function writeOutputIfRequested(parsed: ReturnType<typeof parseCliArgs>, rdf: ExtractedRDF | null): Promise<void> {
  if (!parsed.output) {
    return;
  }

  if (!rdf) {
    throw new Error('Cannot write output because no RDF was discovered');
  }

  const target = await writeRdfOutput(rdf, parsed.output);
  logger.info({ path: target.path, mime: target.mime, triples: target.tripleCount }, 'Saved RDF output to %s (%d triples)', target.path, target.tripleCount);
}

async function writeMergedOutputIfRequested(
  parsed: ReturnType<typeof parseCliArgs>,
  documents: ExtractedRDF[],
  relations: LinkRelationObservation[]
): Promise<void> {
  if (!parsed.output) {
    return;
  }

  if (documents.length === 0 && relations.length === 0) {
    throw new Error('Cannot write output because no RDF was discovered');
  }

  const target = await writeMergedRdfOutput(documents, relations, parsed.output);
  logger.info({ path: target.path, mime: target.mime, triples: target.tripleCount }, 'Saved merged RDF output to %s (%d triples)', target.path, target.tripleCount);
}

export async function runWrxCli(args: string[] = process.argv.slice(2)): Promise<void> {
  let parsed;
  try {
    parsed = parseCliArgs(args);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    return;
  }

  if (parsed.help) {
    printHelp();
    return;
  }

  const url = parsed.input ?? null;
  if (!url) {
    printHelp();
    return;
  }

  if (parsed.verbose) {
    setLogLevel('debug');
  }

  let outputDocument: ExtractedRDF | null = null;
  let mergedDocuments: ExtractedRDF[] = [];
  let mergedRelations: LinkRelationObservation[] = [];

  let overview: any = null;
  if (parsed.all || parsed.report) {
    overview = await extractAllRDF(url);

    mergedRelations = parsed.extendLinks || parsed.profile || parsed.all || parsed.report ? await collectLinkRelationsForUri(url) : [];
    mergedDocuments = (overview.found ?? []).filter((doc: any) => Boolean(doc));

    outputDocument = selectPrimaryRdf(overview);

    if (parsed.provenance && overview?.provenance) {
      mergedDocuments.push({
        uri: url,
        content: overview.provenance,
        mime: 'text/turtle',
        format: 'turtle',
        source: 'provenance',
      });
    }
  } else {
    const result = await extractRDF(url);
    outputDocument = result;

    if (parsed.extendLinks || parsed.profile) {
      mergedRelations = await collectLinkRelationsForUri(url);
    }

    if (result) {
      mergedDocuments = [result];
      if (parsed.provenance && result.provenance) {
        mergedDocuments.push({
          uri: url,
          content: result.provenance,
          mime: 'text/turtle',
          format: 'turtle',
          source: 'provenance',
        });
      }
    }
  }

  if (parsed.profile) {
    if (mergedRelations.length === 0) {
      mergedRelations = await collectLinkRelationsForUri(url);
    }
    const profiles = collectProfileValues(mergedRelations);
    logger.info({ profiles, count: profiles.length }, 'Profiles discovered: %d', profiles.length);
  }

  try {
    if (parsed.output) {
      if (
        parsed.extendLinks ||
        parsed.all ||
        parsed.report ||
        parsed.provenance ||
        mergedDocuments.length > 1 ||
        mergedRelations.length > 0
      ) {
        await writeMergedOutputIfRequested(parsed, mergedDocuments, mergedRelations);
      } else {
        await writeOutputIfRequested(parsed, outputDocument);
      }
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
  }

  if (!parsed.output) {
    if (parsed.provenance) {
      if (mergedDocuments.length > 0 || mergedRelations.length > 0) {
        const { content } = await serializeMergedRdf(mergedDocuments, mergedRelations, 'text/turtle');
        console.log(content.trimEnd());
      } else {
        console.log('No RDF was discovered, thus no provenance was generated.');
      }
    } else {
      if (parsed.all || parsed.report) {
        for (const doc of mergedDocuments) {
          console.log(doc.content);
        }
      } else if (outputDocument) {
        console.log(outputDocument.content);
      }
      if (parsed.extendLinks && mergedRelations.length > 0) {
        console.log(renderLinkRelationsTurtle(mergedRelations));
      }
    }
  }
}