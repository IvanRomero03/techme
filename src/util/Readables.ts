export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  INACTIVE = "INACTIVE",
}

export function readableProjectStatus(status: ProjectStatus): string {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return "Active";
    case ProjectStatus.COMPLETED:
      return "Completed";
    case ProjectStatus.INACTIVE:
      return "Inactive";
    default:
      throw new Error(`Unknown project status: ${status as string}`);
  }
}

export enum ProjectStage {
  REQUIREMENTS = "REQUIREMENTS",
  PLANNING = "PLANNING",
  ANALYSIS = "ANALYSIS",
  ESTIMATIONS = "ESTIMATIONS",
  PROPOSALS = "PROPOSALS",
  VALIDATION = "VALIDATION",
  CLOSED = "CLOSED",
}

export function readableProjectStage(stage: ProjectStage): string {
  switch (stage) {
    case ProjectStage.REQUIREMENTS:
      return "Requirements";
    case ProjectStage.PLANNING:
      return "Planning";
    case ProjectStage.ANALYSIS:
      return "Analysis";
    case ProjectStage.ESTIMATIONS:
      return "Estimations";
    case ProjectStage.PROPOSALS:
      return "Proposals";
    case ProjectStage.VALIDATION:
      return "Validation";
    case ProjectStage.CLOSED:
      return "Closed";
    default:
      throw new Error(`Unknown project stage: ${stage as string}`);
  }
}
