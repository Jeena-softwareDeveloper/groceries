import { prisma } from '../../../lib/prisma.js';

const DEFAULT_SETTINGS: Record<string, unknown> = {
  minOrderValue: 99,
  taxPercent: 5,
  supportEmail: 'support@districtmart.com',
  supportPhone: '+910000000000',
  featureFlags: { wallet: false, cod: true },
};

export async function getSettings() {
  const rows = await prisma.appSetting.findMany();
  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSettings(data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    await prisma.appSetting.upsert({
      where: { key },
      create: { key, value: value as object },
      update: { value: value as object },
    });
  }
  return getSettings();
}
