import { z } from 'zod';
import { prisma } from '../../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function listCategories(parentId?: string | null) {
  const where = parentId === undefined ? {} : { parentId: parentId ?? null };
  return prisma.category.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: { children: { orderBy: { sortOrder: 'asc' } }, _count: { select: { products: true } } },
  });
}

export async function getCategory(id: string) {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { children: true, parent: true },
  });
  if (!cat) throw new NotFoundError('Category not found');
  return cat;
}

export async function createCategory(data: z.infer<typeof categorySchema>) {
  const parsed = categorySchema.parse(data);
  if (parsed.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.parentId } });
    if (!parent) throw new ValidationError('Parent category not found');
  }
  return prisma.category.create({ data: parsed });
}

export async function updateCategory(id: string, data: Partial<z.infer<typeof categorySchema>>) {
  await getCategory(id);
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const cat = await getCategory(id);
  if (cat.children.length > 0) throw new ValidationError('Cannot delete category with subcategories');
  await prisma.category.delete({ where: { id } });
}
