import {
  type ProvModel,
  type ProvActivity,
  type ProvEntity,
  serializeProvModelToTurtle,
} from './serializer';

export class ProvenanceTracker {
  private model: ProvModel;

  constructor(targetUri: string, agentLabel: string = 'wrx v1.0.0') {
    const agentId = globalThis.crypto ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2);
    this.model = {
      targetUri,
      agentId,
      agentLabel,
      activities: new Map(),
      entities: new Map(),
      plans: new Map(),
    };
  }

  /**
   * Registers and begins an activity.
   */
  public startActivity(label: string, planUri: string): string {
    const id = globalThis.crypto ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2);
    const startedAtTime = new Date().toISOString();

    const activity: ProvActivity = {
      id,
      label,
      planUri,
      startedAtTime,
      used: new Set(),
      informedBy: new Set(),
    };

    this.model.activities.set(id, activity);

    if (!this.model.plans.has(planUri)) {
      this.model.plans.set(planUri, label + ' Specification');
    }

    return id;
  }

  /**
   * Marks an activity as ended.
   */
  public endActivity(activityId: string): void {
    const act = this.model.activities.get(activityId);
    if (act && !act.endedAtTime) {
      act.endedAtTime = new Date().toISOString();
    }
  }

  /**
   * Records that an activity used a given entity.
   */
  public recordUsage(activityId: string, entityUri: string): void {
    const act = this.model.activities.get(activityId);
    if (act) {
      act.used.add(entityUri);
    }
  }

  /**
   * Records that an activity was informed by a prior activity.
   */
  public recordInformedBy(activityId: string, priorActivityId: string): void {
    const act = this.model.activities.get(activityId);
    if (act) {
      act.informedBy.add(priorActivityId);
    }
  }

  /**
   * Records that an entity was derived from another entity.
   */
  public recordDerivation(
    targetEntityUri: string,
    derivedFromUri: string,
    activityId?: string,
    planUri?: string
  ): void {
    let entity = this.model.entities.get(targetEntityUri);
    if (!entity) {
      entity = {
        uri: targetEntityUri,
        derivations: [],
      };
      this.model.entities.set(targetEntityUri, entity);
    }

    entity.derivations.push({
      sourceUri: derivedFromUri,
      activityId,
      planUri,
    });
  }

  /**
   * Records a successfully extracted metadata entity output.
   */
  public recordOutput(
    outputUri: string,
    payload: string,
    activityId: string,
    planUri: string,
    derivedFromUri?: string
  ): void {
    const generatedAtTime = new Date().toISOString();
    const source = derivedFromUri || this.model.targetUri;

    const entity: ProvEntity = {
      uri: outputUri,
      label: 'Extracted RDF Metadata',
      generatedByActivityId: activityId,
      generatedAtTime,
      value: payload,
      derivations: [
        {
          sourceUri: source,
          activityId,
          planUri,
        },
      ],
    };

    this.model.entities.set(outputUri, entity);
  }

  /**
   * Serializes the entire provenance graph to pure W3C PROV-O RDF Turtle.
   */
  public toTurtle(): string {
    return serializeProvModelToTurtle(this.model);
  }
}
