export interface ProvActivity {
  id: string;
  label: string;
  planUri: string;
  startedAtTime: string;
  endedAtTime?: string;
  used: Set<string>;
  informedBy: Set<string>;
}

export interface ProvDerivation {
  sourceUri: string;
  activityId?: string;
  planUri?: string;
}

export interface ProvEntity {
  uri: string;
  label?: string;
  generatedByActivityId?: string;
  generatedAtTime?: string;
  derivations: ProvDerivation[];
  value?: string;
}

export interface ProvModel {
  targetUri: string;
  agentId: string;
  agentLabel: string;
  activities: Map<string, ProvActivity>;
  entities: Map<string, ProvEntity>;
  plans: Map<string, string>; // planUri -> label
}

function escapeTurtleLiteral(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Serializes the internal provenance model into pure W3C PROV-O RDF Turtle.
 */
export function serializeProvModelToTurtle(model: ProvModel): string {
  let ttl = `@prefix prov: <http://www.w3.org/ns/prov#> .\n` +
            `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n` +
            `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n`;

  // 1. Target Resource Entity
  ttl += `# Target Resource\n`;
  ttl += `<${model.targetUri}> a prov:Entity ;\n`;
  ttl += `    rdfs:label "Target Resource" .\n\n`;

  // 2. Software Agent
  ttl += `# Software Agent\n`;
  ttl += `<urn:uuid:${model.agentId}> a prov:SoftwareAgent ;\n`;
  ttl += `    rdfs:label "${escapeTurtleLiteral(model.agentLabel)}" .\n\n`;

  // 3. Plans
  if (model.plans.size > 0) {
    ttl += `# Plans & Specifications\n`;
    for (const [planUri, label] of model.plans.entries()) {
      ttl += `<${planUri}> a prov:Plan ;\n`;
      ttl += `    rdfs:label "${escapeTurtleLiteral(label)}" .\n\n`;
    }
  }

  // 4. Activities
  if (model.activities.size > 0) {
    ttl += `# Discovery Activities\n`;
    for (const act of model.activities.values()) {
      ttl += `<urn:uuid:${act.id}> a prov:Activity ;\n`;
      ttl += `    rdfs:label "${escapeTurtleLiteral(act.label)}" ;\n`;
      ttl += `    prov:startedAtTime "${act.startedAtTime}"^^xsd:dateTime ;\n`;
      if (act.endedAtTime) {
        ttl += `    prov:endedAtTime "${act.endedAtTime}"^^xsd:dateTime ;\n`;
      }
      ttl += `    prov:wasAssociatedWith <urn:uuid:${model.agentId}> ;\n`;
      ttl += `    prov:qualifiedAssociation [\n`;
      ttl += `        a prov:Association ;\n`;
      ttl += `        prov:agent <urn:uuid:${model.agentId}> ;\n`;
      ttl += `        prov:hadPlan <${act.planUri}>\n`;
      ttl += `    ]`;

      for (const usedUri of act.used) {
        ttl += ` ;\n    prov:used <${usedUri}>`;
      }

      for (const informedById of act.informedBy) {
        ttl += ` ;\n    prov:wasInformedBy <urn:uuid:${informedById}>`;
      }

      ttl += ` .\n\n`;
    }
  }

  // 5. Entities (including outputs and intermediaries)
  if (model.entities.size > 0) {
    ttl += `# Intermediary and Extracted Entities\n`;
    for (const ent of model.entities.values()) {
      ttl += `<${ent.uri}> a prov:Entity`;
      if (ent.label) {
        ttl += ` ;\n    rdfs:label "${escapeTurtleLiteral(ent.label)}"`;
      }
      if (ent.generatedAtTime) {
        ttl += ` ;\n    prov:generatedAtTime "${ent.generatedAtTime}"^^xsd:dateTime`;
      }
      if (ent.generatedByActivityId) {
        ttl += ` ;\n    prov:wasGeneratedBy <urn:uuid:${ent.generatedByActivityId}>`;
      }
      if (ent.value !== undefined) {
        ttl += ` ;\n    prov:value "${escapeTurtleLiteral(ent.value)}"`;
      }

      for (const deriv of ent.derivations) {
        ttl += ` ;\n    prov:wasDerivedFrom <${deriv.sourceUri}>`;
        if (deriv.activityId || deriv.planUri) {
          ttl += ` ;\n    prov:qualifiedDerivation [\n`;
          ttl += `        a prov:Derivation ;\n`;
          ttl += `        prov:entity <${deriv.sourceUri}>`;
          if (deriv.activityId) {
            ttl += ` ;\n        prov:hadActivity <urn:uuid:${deriv.activityId}>`;
          }
          if (deriv.planUri) {
            ttl += ` ;\n        prov:hadPlan <${deriv.planUri}>`;
          }
          ttl += `\n    ]`;
        }
      }

      ttl += ` .\n\n`;
    }
  }

  return ttl;
}
