import { Favorite, Pollution, User } from '../models';
import { PollutionWithMeta } from './pollution.service';

export class FavoriteService {
  async getUserFavorites(userId: string): Promise<PollutionWithMeta[]> {
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Pollution,
          as: 'pollution',
          include: [
            {
              model: User,
              as: 'discoverer',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return favorites.map((favorite) => {
      const pollution = favorite.get('pollution') as Pollution;
      const plain = pollution.get({ plain: true }) as PollutionWithMeta;
      plain.discovererName = pollution.discoverer?.name;
      plain.isFavorite = true;
      return plain;
    });
  }

  async addFavorite(userId: string, pollutionId: string): Promise<Favorite | null> {
    // Verifier que la pollution existe
    const pollution = await Pollution.findByPk(pollutionId);
    if (!pollution) {
      return null;
    }

    // Verifier si deja en favori
    const existing = await Favorite.findOne({
      where: { userId, pollutionId }
    });

    if (existing) {
      return existing;
    }

    return Favorite.create({ userId, pollutionId });
  }

  async removeFavorite(userId: string, pollutionId: string): Promise<boolean> {
    const result = await Favorite.destroy({
      where: { userId, pollutionId }
    });

    return result > 0;
  }

  async isFavorite(userId: string, pollutionId: string): Promise<boolean> {
    const favorite = await Favorite.findOne({
      where: { userId, pollutionId }
    });

    return !!favorite;
  }
}

export const favoriteService = new FavoriteService();
