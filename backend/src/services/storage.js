import { prisma } from "./prisma.js";

function toDomainLink(dbItem) {
  if (!dbItem) {
    return null;
  }

  return {
    id: dbItem.id,
    originalUrl: dbItem.originalUrl,
    preview: {
      title: dbItem.previewTitle,
      description: dbItem.previewDescription,
      image: dbItem.previewImage
    },
    createdAt: dbItem.createdAt.toISOString()
  };
}

export async function findByOriginalUrl(url) {
  const link = await prisma.link.findUnique({
    where: { originalUrl: url }
  });

  return toDomainLink(link);
}

export async function findById(id) {
  const link = await prisma.link.findUnique({
    where: { id }
  });

  return toDomainLink(link);
}

export async function saveLink(link) {
  const created = await prisma.link.create({
    data: {
      id: link.id,
      originalUrl: link.originalUrl,
      previewTitle: link.preview.title,
      previewDescription: link.preview.description,
      previewImage: link.preview.image,
      createdAt: new Date(link.createdAt)
    }
  });

  return toDomainLink(created);
}
