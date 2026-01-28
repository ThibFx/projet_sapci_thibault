import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FavoriteAttributes {
  id: string;
  userId: string;
  pollutionId: string;
  createdAt: Date;
}

export interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'id' | 'createdAt'> {}

export class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  declare id: string;
  declare userId: string;
  declare pollutionId: string;
  declare createdAt: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    pollutionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'pollution_id',
      references: {
        model: 'pollutions',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  },
  {
    sequelize,
    tableName: 'favorites',
    modelName: 'Favorite',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'pollution_id']
      }
    ]
  }
);
