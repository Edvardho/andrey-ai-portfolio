import { mkdir, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import {
  CASE_ASSET_INBOX_ROOT,
  CASE_ASSET_ROOT,
  formatBytes,
  getCaseAssetRule,
  isSupportedCaseAsset,
} from './case-asset-rules';

type AssetJob = {
  sourcePath: string;
  targetPath: string;
  caseId: string;
  fileName: string;
  fromInbox: boolean;
};

type OptimizationResult = {
  job: AssetJob;
  beforeBytes: number;
  afterBytes: number;
  oldRatio?: number;
  newRatio?: number;
  skipped?: boolean;
  warning?: string;
};

const args = new Set(process.argv.slice(2));
const optimizeAllExisting = args.has('--all-existing');

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getCaseIds(): Promise<Set<string>> {
  const entries = await readdir(CASE_ASSET_ROOT, { withFileTypes: true });
  return new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
}

async function collectInboxJobs(caseIds: Set<string>): Promise<AssetJob[]> {
  if (!(await exists(CASE_ASSET_INBOX_ROOT))) {
    return [];
  }

  const jobs: AssetJob[] = [];
  const caseEntries = await readdir(CASE_ASSET_INBOX_ROOT, { withFileTypes: true });

  for (const caseEntry of caseEntries) {
    if (!caseEntry.isDirectory()) {
      continue;
    }

    const caseId = caseEntry.name;
    if (!caseIds.has(caseId)) {
      throw new Error(`Unknown case folder in asset-inbox: ${caseId}`);
    }

    const sourceDir = path.join(CASE_ASSET_INBOX_ROOT, caseId);
    const files = await readdir(sourceDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !isSupportedCaseAsset(file.name)) {
        continue;
      }

      const targetPath = path.join(CASE_ASSET_ROOT, caseId, file.name);
      if (!(await exists(targetPath))) {
        throw new Error(`No existing target asset for ${caseId}/${file.name}`);
      }

      jobs.push({
        sourcePath: path.join(sourceDir, file.name),
        targetPath,
        caseId,
        fileName: file.name,
        fromInbox: true,
      });
    }
  }

  return jobs;
}

async function collectExistingJobs(caseIds: Set<string>): Promise<AssetJob[]> {
  const jobs: AssetJob[] = [];

  for (const caseId of caseIds) {
    const sourceDir = path.join(CASE_ASSET_ROOT, caseId);
    const files = await readdir(sourceDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !isSupportedCaseAsset(file.name)) {
        continue;
      }

      const sourcePath = path.join(sourceDir, file.name);
      jobs.push({
        sourcePath,
        targetPath: sourcePath,
        caseId,
        fileName: file.name,
        fromInbox: false,
      });
    }
  }

  return jobs;
}

function resizeOptions(width?: number, height?: number, maxLongSide?: number) {
  if (!width || !height || !maxLongSide) {
    return null;
  }

  if (Math.max(width, height) <= maxLongSide) {
    return null;
  }

  return width >= height
    ? { width: maxLongSide, withoutEnlargement: true }
    : { height: maxLongSide, withoutEnlargement: true };
}

function encodeForExtension(image: sharp.Sharp, extension: string): sharp.Sharp {
  switch (extension.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return image.jpeg({ quality: 82, mozjpeg: true });
    case '.webp':
      return image.webp({ quality: 82, effort: 5 });
    case '.png':
    default:
      return image.png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 });
  }
}

async function optimizeJob(job: AssetJob): Promise<OptimizationResult> {
  const rule = getCaseAssetRule(job.fileName);
  const oldMetadata = await sharp(job.targetPath).metadata();
  const newMetadata = await sharp(job.sourcePath).metadata();
  const beforeBytes = (await stat(job.targetPath)).size;
  const oldRatio = oldMetadata.width && oldMetadata.height ? oldMetadata.width / oldMetadata.height : undefined;
  const newRatio = newMetadata.width && newMetadata.height ? newMetadata.width / newMetadata.height : undefined;

  const resize = resizeOptions(newMetadata.width, newMetadata.height, rule.maxLongSide);
  const pipeline = sharp(job.sourcePath).rotate();
  const optimized = resize ? pipeline.resize(resize) : pipeline;
  const encoded = encodeForExtension(optimized, path.extname(job.fileName));
  const buffer = await encoded.toBuffer();
  const tempPath = `${job.targetPath}.tmp`;

  if (!job.fromInbox && buffer.byteLength > beforeBytes) {
    return {
      job,
      beforeBytes,
      afterBytes: beforeBytes,
      oldRatio,
      newRatio,
      skipped: true,
      warning: `kept original because optimized output was larger (${formatBytes(buffer.byteLength)})`,
    };
  }

  const ratioDiff = oldRatio && newRatio ? Math.abs(oldRatio - newRatio) / oldRatio : 0;

  await mkdir(path.dirname(job.targetPath), { recursive: true });
  await writeFile(tempPath, buffer);
  await rename(tempPath, job.targetPath);

  if (job.fromInbox) {
    await unlink(job.sourcePath);
  }

  return {
    job,
    beforeBytes,
    afterBytes: buffer.byteLength,
    oldRatio,
    newRatio,
    warning: ratioDiff > 0.03
      ? `aspect ratio changed from ${oldRatio?.toFixed(3)} to ${newRatio?.toFixed(3)}`
      : undefined,
  };
}

function printResult(result: OptimizationResult) {
  const delta = result.beforeBytes - result.afterBytes;
  const sign = delta >= 0 ? '-' : '+';
  const status = result.skipped ? 'kept' : `${formatBytes(result.afterBytes)}`;
  console.log(
    `${result.job.caseId}/${result.job.fileName}: ${formatBytes(result.beforeBytes)} -> ${status} (${sign}${formatBytes(Math.abs(delta))})`,
  );

  if (result.warning) {
    console.warn(`  warning: ${result.warning}`);
  }
}

async function main() {
  const caseIds = await getCaseIds();
  const jobs = optimizeAllExisting ? await collectExistingJobs(caseIds) : await collectInboxJobs(caseIds);

  if (!jobs.length) {
    console.log(
      optimizeAllExisting
        ? 'No case assets found.'
        : 'No incoming assets found in asset-inbox. Put files into asset-inbox/<caseId>/<fileName>.',
    );
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;

  for (const job of jobs) {
    const result = await optimizeJob(job);
    totalBefore += result.beforeBytes;
    totalAfter += result.afterBytes;
    printResult(result);
  }

  const delta = totalBefore - totalAfter;
  const sign = delta >= 0 ? '-' : '+';
  console.log(`Optimized ${jobs.length} assets.`);
  console.log(`Total: ${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)} (${sign}${formatBytes(Math.abs(delta))})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
