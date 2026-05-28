import {
  buildPipelinePlan,
  describeConfigForCli,
  executePipeline,
  formatDoctorMarkdown,
  formatPipelinePlanMarkdown,
  loadProjectConfig,
  runDoctor,
  type PipelineCommand,
} from '../pipeline/core';

type ParsedArgs = {
  command: PipelineCommand;
  options: Record<string, string | boolean>;
};

const parseArgs = (argv: string[]): ParsedArgs => {
  const [commandRaw, ...rest] = argv;

  if (
    commandRaw !== 'validate' &&
    commandRaw !== 'doctor' &&
    commandRaw !== 'plan' &&
    commandRaw !== 'run' &&
    commandRaw !== 'render'
  ) {
    throw new Error(`Unknown command: ${commandRaw ?? '(missing)'}`);
  }

  const options: Record<string, string | boolean> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const next = rest[index + 1];

    if (!next || next.startsWith('--')) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return {
    command: commandRaw,
    options,
  };
};

const requiredOption = (options: Record<string, string | boolean>, key: string): string => {
  const value = options[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required option --${key}`);
  }

  return value;
};

const main = async () => {
  const parsed = parseArgs(process.argv.slice(2));
  const configPath =
    typeof parsed.options.config === 'string'
      ? parsed.options.config
      : parsed.command === 'doctor'
        ? './project.yaml'
        : requiredOption(parsed.options, 'config');
  const loaded = await loadProjectConfig(configPath);
  const format = typeof parsed.options.format === 'string' ? parsed.options.format : 'json';

  if (parsed.command === 'doctor') {
    const report = runDoctor(loaded);
    console.log(format === 'markdown' ? formatDoctorMarkdown(report) : JSON.stringify(report, null, 2));
    process.exitCode = report.ok ? 0 : 1;
    return;
  }

  if (parsed.command === 'validate') {
    console.log(JSON.stringify({ok: true, ...describeConfigForCli(loaded)}, null, 2));
    return;
  }

  if (parsed.command === 'plan') {
    const plan = buildPipelinePlan(loaded);
    console.log(format === 'markdown' ? formatPipelinePlanMarkdown(plan) : JSON.stringify({ok: true, plan}, null, 2));
    return;
  }

  const result = await executePipeline(loaded, {
    dryRun: parsed.options['dry-run'] === true,
    mode: parsed.command,
    runId: typeof parsed.options['run-id'] === 'string' ? parsed.options['run-id'] : undefined,
  });

  console.log(
    JSON.stringify(
      {
        ok: result.summary.failed === 0,
        manifestPath: result.manifestPath,
        renderOutputPath: result.renderOutputPath,
        plan: result.plan.totals,
        creditEstimate: result.plan.creditEstimate,
        dryRunFiles: result.dryRunFiles ?? null,
        summary: result.summary,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
