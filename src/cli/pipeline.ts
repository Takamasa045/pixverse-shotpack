import {
  buildPipelinePlan,
  describeConfigForCli,
  executePipeline,
  exportMichibikiHandoff,
  formatDoctorMarkdown,
  formatPipelinePlanMarkdown,
  loadProjectConfig,
  runDoctor,
  type MichibikiEngine,
  type MichibikiLicenseMode,
  type MichibikiOutputType,
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
    commandRaw !== 'export' &&
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

const stringOption = (options: Record<string, string | boolean>, key: string) => {
  const value = options[key];
  return typeof value === 'string' ? value : undefined;
};

const oneOfOption = <T extends string>(
  options: Record<string, string | boolean>,
  key: string,
  allowed: readonly T[],
) => {
  const value = stringOption(options, key);
  if (value === undefined) {
    return undefined;
  }

  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid --${key}: ${value}. Expected one of: ${allowed.join(', ')}`);
  }

  return value as T;
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

  if (parsed.command === 'export') {
    const result = exportMichibikiHandoff(loaded, {
      outputPath: stringOption(parsed.options, 'output'),
      handoffPath: stringOption(parsed.options, 'handoff-output'),
      engine: oneOfOption<MichibikiEngine>(parsed.options, 'engine', ['auto', 'editframe', 'hyperframes', 'remotion']),
      outputType: oneOfOption<MichibikiOutputType>(
        parsed.options,
        'output-type',
        ['code', 'mp4', 'preview', 'project', 'webm'],
      ),
      licenseMode: oneOfOption<MichibikiLicenseMode>(
        parsed.options,
        'license-mode',
        ['client-work', 'commercial', 'oss', 'personal'],
      ),
      allowCloudRender: parsed.options['allow-cloud-render'] === true,
      michibikiPath: stringOption(parsed.options, 'michibiki-path'),
      runMichibiki: parsed.options['run-michibiki'] === true,
      dryRun: parsed.options['dry-run'] === true,
    });
    console.log(format === 'videospec' ? JSON.stringify(result.videoSpec, null, 2) : JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
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
