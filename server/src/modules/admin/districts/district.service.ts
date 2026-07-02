import { z } from 'zod';
import { prisma } from '../../../lib/prisma.js';
import { NotFoundError } from '../../../utils/errors.js';

const districtSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10),
  isActive: z.boolean().optional(),
});

export async function listDistricts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.district.findMany({ skip, take: limit, orderBy: { name: 'asc' }, include: { _count: { select: { areas: true } } } }),
    prisma.district.count(),
  ]);
  return { items, total, page, limit };
}

export async function getDistrict(id: string) {
  const district = await prisma.district.findUnique({
    where: { id },
    include: { areas: true },
  });
  if (!district) throw new NotFoundError('District not found');
  return district;
}

export async function createDistrict(data: z.infer<typeof districtSchema>) {
  const parsed = districtSchema.parse(data);
  return prisma.district.create({ data: parsed });
}

export async function updateDistrict(id: string, data: Partial<z.infer<typeof districtSchema>>) {
  await getDistrict(id);
  return prisma.district.update({ where: { id }, data });
}

export async function deleteDistrict(id: string) {
  await getDistrict(id);
  await prisma.district.delete({ where: { id } });
}
