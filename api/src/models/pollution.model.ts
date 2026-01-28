import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export type PollutionType = 'plastic' | 'chemical' | 'wild_dumping' | 'water' | 'air' | 'other';
export type PollutionStatus = 'open' | 'investigating' | 'resolved';

export interface PollutionAttributes {
  id: string;
  name: string;
  type: PollutionType;
  city: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  recordedAt: Date;
  description: string;
  status: PollutionStatus;
  photoData: string | null;
  photoMimeType: string | null;
  discovererId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollutionCreationAttributes extends Optional<PollutionAttributes, 'id' | 'latitude' | 'longitude' | 'address' | 'photoData' | 'photoMimeType' | 'discovererId' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Pollution extends Model<PollutionAttributes, PollutionCreationAttributes> implements PollutionAttributes {
  declare id: string;
  declare name: string;
  declare type: PollutionType;
  declare city: string;
  declare latitude: number | null;
  declare longitude: number | null;
  declare address: string | null;
  declare recordedAt: Date;
  declare description: string;
  declare status: PollutionStatus;
  declare photoData: string | null;
  declare photoMimeType: string | null;
  declare discovererId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Association
  declare discoverer?: User;
}

Pollution.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [3, 255]
      }
    },
    type: {
      type: DataTypes.ENUM('plastic', 'chemical', 'wild_dumping', 'water', 'air', 'other'),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'recorded_at'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 10000]
      }
    },
    status: {
      type: DataTypes.ENUM('open', 'investigating', 'resolved'),
      allowNull: false,
      defaultValue: 'open'
    },
    photoData: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'photo_data'
    },
    photoMimeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'photo_mime_type'
    },
    discovererId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'discoverer_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'pollutions',
    modelName: 'Pollution',
    timestamps: true,
    underscored: true
  }
);
