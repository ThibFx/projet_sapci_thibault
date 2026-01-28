import { Op, WhereOptions } from 'sequelize';
import { Pollution, User, Favorite } from '../models';
import { PollutionAttributes, PollutionCreationAttributes } from '../models/pollution.model';
import { CreatePollutionBody, UpdatePollutionBody, PollutionFilters } from '../dto/pollution.dto';

export interface PollutionWithMeta extends PollutionAttributes {
  discovererName?: string;
  isFavorite?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PhotoData {
  base64: string;
  mimeType: string;
}

export class PollutionService {
  async findAll(
    filters: PollutionFilters,
    userId?: string
  ): Promise<PaginatedResult<PollutionWithMeta>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<PollutionAttributes> = {};

    if (filters.search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
        { city: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    if (filters.type) {
      where.type = filters.type as PollutionAttributes['type'];
    }

    if (filters.city) {
      where.city = { [Op.iLike]: `%${filters.city}%` } as unknown as string;
    }

    if (filters.status) {
      where.status = filters.status as PollutionAttributes['status'];
    }

    const { rows, count } = await Pollution.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'discoverer',
          attributes: ['id', 'name']
        }
      ],
      order: [['recordedAt', 'DESC']],
      limit,
      offset
    });

    // Recuperer les favoris de l'utilisateur si connecte
    let userFavoriteIds: Set<string> = new Set();
    if (userId) {
      const favorites = await Favorite.findAll({
        where: { userId },
        attributes: ['pollutionId']
      });
      userFavoriteIds = new Set(favorites.map((f) => f.pollutionId));
    }

    const data: PollutionWithMeta[] = rows.map((pollution) => {
      const plain = pollution.get({ plain: true }) as PollutionWithMeta;
      plain.discovererName = pollution.discoverer?.name;
      plain.isFavorite = userFavoriteIds.has(pollution.id);
      return plain;
    });

    return {
      data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async findById(id: string, userId?: string): Promise<PollutionWithMeta | null> {
    const pollution = await Pollution.findByPk(id, {
      include: [
        {
          model: User,
          as: 'discoverer',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!pollution) {
      return null;
    }

    const plain = pollution.get({ plain: true }) as PollutionWithMeta;
    plain.discovererName = pollution.discoverer?.name;

    if (userId) {
      const favorite = await Favorite.findOne({
        where: { userId, pollutionId: id }
      });
      plain.isFavorite = !!favorite;
    }

    return plain;
  }

  async create(
    data: CreatePollutionBody,
    photoData: PhotoData | null,
    discovererId: string | null
  ): Promise<Pollution> {
    const pollutionData: PollutionCreationAttributes = {
      name: data.name,
      type: data.type as PollutionAttributes['type'],
      city: data.city,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      address: data.address ?? null,
      recordedAt: new Date(data.recordedAt),
      description: data.description,
      status: (data.status as PollutionAttributes['status']) || 'open',
      photoData: photoData?.base64 ?? null,
      photoMimeType: photoData?.mimeType ?? null,
      discovererId
    };

    return Pollution.create(pollutionData);
  }

  async update(
    id: string,
    data: UpdatePollutionBody,
    photoData?: PhotoData | null
  ): Promise<Pollution | null> {
    const pollution = await Pollution.findByPk(id);
    if (!pollution) {
      return null;
    }

    const updateData: Partial<PollutionCreationAttributes> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type as PollutionAttributes['type'];
    if (data.city !== undefined) updateData.city = data.city;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.recordedAt !== undefined) updateData.recordedAt = new Date(data.recordedAt);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status as PollutionAttributes['status'];

    // Gerer la photo (stockee en Base64)
    if (photoData !== undefined) {
      updateData.photoData = photoData?.base64 ?? null;
      updateData.photoMimeType = photoData?.mimeType ?? null;
    }

    await pollution.update(updateData);
    return pollution.reload();
  }

  async delete(id: string): Promise<boolean> {
    const pollution = await Pollution.findByPk(id);
    if (!pollution) {
      return false;
    }

    await pollution.destroy();
    return true;
  }

  // Convertir un fichier Buffer en donnees Base64
  static fileToBase64(buffer: Buffer, mimeType: string): PhotoData {
    return {
      base64: buffer.toString('base64'),
      mimeType
    };
  }
}

export const pollutionService = new PollutionService();
