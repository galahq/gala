import type { StageContext } from "../config.ts";

export type StageRunners = {
  dev: (context: StageContext) => unknown;
  production: (context: StageContext) => unknown;
  preview: (context: StageContext) => unknown;
  local: (context: StageContext) => unknown;
};

type RunnerResult<Runners extends StageRunners> =
  | ReturnType<Runners["dev"]>
  | ReturnType<Runners["production"]>
  | ReturnType<Runners["preview"]>
  | ReturnType<Runners["local"]>;

export function runStageWith<Runners extends StageRunners>(
  context: StageContext,
  runners: Runners,
): RunnerResult<Runners> {
  switch (context.target.kind) {
    case "dev":
      return runners.dev(context) as RunnerResult<Runners>;
    case "production":
      return runners.production(context) as RunnerResult<Runners>;
    case "preview":
      return runners.preview(context) as RunnerResult<Runners>;
    case "local":
      return runners.local(context) as RunnerResult<Runners>;
  }
}
