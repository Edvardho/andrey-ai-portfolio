import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import {
  CASE_ASSET_INBOX_ROOT,
  CASE_ASSET_ROOT,
  formatBytes,
  getCaseAssetKind,
  getCaseAssetRule,
  isSupportedCaseAsset,
} from './case-asset-rules';

const allowedOversizedAssets = new Map<string, string>([
  // Keep this list explicit. If a file needs to exceed its budget, explain why here.
]);

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function hasInboxPayload(dirPath: string): Promise<boolean> {
  if (!(await exists(dirPath))) {
    return false;
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory() && await hasInboxPayload(entryPath)) {
      return true;
    }

    if (entry.isFile() && isSupportedCaseAsset(entry.name)) {
      return true;
    }
  }

  return false;
}

async function main() {
  const failures: string[] = [];
  const caseEntries = await readdir(CASE_ASSET_ROOT, { withFileTypes: true });
  let checked = 0;

  for (const caseEntry of caseEntries) {
    if (!caseEntry.isDirectory()) {
      continue;
    }

    const caseId = caseEntry.name;
    const caseDir = path.join(CASE_ASSET_ROOT, caseId);
    const files = await readdir(caseDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !isSupportedCaseAsset(file.name)) {
        continue;
      }

      checked += 1;
      const filePath = path.join(caseDir, file.name);
      const relativePath = `${caseId}/${file.name}`;
      const stats = await stat(filePath);
      const metadata = await sharp(filePath).metadata();
      const rule = getCaseAssetRule(file.name);
      const allowReason = allowedOversizedAssets.get(relativePath);

      if (!metadata.width || !metadata.height) {
        failures.push(`${relativePath}: image metadata is unreadable`);
      }

      if (metadata.width && metadata.height) {
        const longSide = Math.max(metadata.width, metadata.height);
        if (longSide > rule.maxLongSide) {
          failures.push(
            `${relativePath}: long side ${longSide}px exceeds ${getCaseAssetKind(file.name)} limit ${rule.maxLongSide}px`,
          );
        }
      }

      if (stats.size > rule.maxBytes && !allowReason) {
        failures.push(
          `${relativePath}: ${formatBytes(stats.size)} exceeds ${getCaseAssetKind(file.name)} budget ${formatBytes(rule.maxBytes)}`,
        );
      }
    }
  }

  if (await hasInboxPayload(CASE_ASSET_INBOX_ROOT)) {
    failures.push('asset-inbox/ contains case assets. Run npm run assets:optimize before committing.');
  }

  if (failures.length) {
    throw new Error(`Case asset verification failed:\n${failures.map((item) => `- ${item}`).join('\n')}`);
  }

  console.log(`Case asset contract passed. Checked ${checked} assets.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
