import path from 'node:path';

export const CASE_ASSET_ROOT = path.join(process.cwd(), 'public', 'cases');
export const CASE_ASSET_INBOX_ROOT = path.join(process.cwd(), 'asset-inbox');

export type CaseAssetKind =
  | 'rail'
  | 'small_preview'
  | 'large_case_image'
  | 'overlay'
  | 'other';

export type CaseAssetRule = {
  kind: CaseAssetKind;
  maxLongSide: number;
  maxBytes: number;
};

const ONE_KB = 1024;

export function getCaseAssetKind(fileName: string): CaseAssetKind {
  if (fileName === 'rail.png') {
    return 'rail';
  }

  if (fileName === 'entry.png' || fileName === 'context.png' || fileName === 'intro-preview.png') {
    return 'small_preview';
  }

  if (fileName.endsWith('-overlay.png')) {
    return 'overlay';
  }

  if (fileName.startsWith('showcase-') || fileName.startsWith('disclosure-')) {
    return 'large_case_image';
  }

  return 'other';
}

export function getCaseAssetRule(fileName: string): CaseAssetRule {
  const kind = getCaseAssetKind(fileName);

  switch (kind) {
    case 'rail':
      return { kind, maxLongSide: 360, maxBytes: 150 * ONE_KB };
    case 'small_preview':
      return { kind, maxLongSide: 960, maxBytes: 500 * ONE_KB };
    case 'overlay':
      return { kind, maxLongSide: 1800, maxBytes: 900 * ONE_KB };
    case 'large_case_image':
      return { kind, maxLongSide: 1800, maxBytes: 1200 * ONE_KB };
    case 'other':
    default:
      return { kind, maxLongSide: 1800, maxBytes: 1200 * ONE_KB };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < ONE_KB) {
    return `${bytes} B`;
  }

  const megabytes = bytes / (ONE_KB * ONE_KB);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(2)} MB`;
  }

  return `${(bytes / ONE_KB).toFixed(0)} KB`;
}

export function isSupportedCaseAsset(fileName: string): boolean {
  return /\.(png|jpe?g|webp)$/i.test(fileName);
}
