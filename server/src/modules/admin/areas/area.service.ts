import { z } from 'zod';
import { prisma } from '../../../lib/prisma.js';
import { NotFoundError } from '../../../utils/errors.js';

const areaSchema = z.object({
  districtId: z.string(),
  name: z.string().min(2),
  pincode: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function listAreas(districtId?: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = districtId ? { districtId } : {};
  const [items, total] = await Promise.all([
    prisma.area.findMany({ where, skip, take: limit, orderBy: { name: 'asc' }, include: { district: { select: { id: true, name: true } } } }),
    prisma.area.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function getArea(id: string) {
  const area = await prisma.area.findUnique({ where: { id }, include: { district: true } });
  if (!area) throw new NotFoundError('Area not found');
  return area;
}

export async function createArea(data: z.infer<typeof areaSchema>) {
  const parsed = areaSchema.parse(data);
  return prisma.area.create({ data: parsed });
}

export async function updateArea(id: string, data: Partial<z.infer<typeof areaSchema>>) {
  await getArea(id);
  return prisma.area.update({ where: { id }, data });
}

export async function deleteArea(id: string) {
  await getArea(id);
  await prisma.area.delete({ where: { id } });
}
