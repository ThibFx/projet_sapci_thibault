import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'refreshToken' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare refreshToken: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  toJSON(): Omit<UserAttributes, 'passwordHash' | 'refreshToken'> {
    const values = { ...this.get() };
    delete (values as Partial<UserAttributes>).passwordHash;
    delete (values as Partial<UserAttributes>).refreshToken;
    return values as Omit<UserAttributes, 'passwordHash' | 'refreshToken'>;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    refreshToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'refresh_token'
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
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    underscored: true
  }
);
