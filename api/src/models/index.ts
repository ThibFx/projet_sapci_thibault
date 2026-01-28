import { User } from './user.model';
import { Pollution } from './pollution.model';
import { Favorite } from './favorite.model';

// Associations User <-> Pollution
User.hasMany(Pollution, {
  foreignKey: 'discovererId',
  as: 'discoveries'
});

Pollution.belongsTo(User, {
  foreignKey: 'discovererId',
  as: 'discoverer'
});

// Associations User <-> Favorite <-> Pollution
User.hasMany(Favorite, {
  foreignKey: 'userId',
  as: 'favorites'
});

Favorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Pollution.hasMany(Favorite, {
  foreignKey: 'pollutionId',
  as: 'favorites'
});

Favorite.belongsTo(Pollution, {
  foreignKey: 'pollutionId',
  as: 'pollution'
});

// Association many-to-many via Favorite
User.belongsToMany(Pollution, {
  through: Favorite,
  foreignKey: 'userId',
  otherKey: 'pollutionId',
  as: 'favoritePollutions'
});

Pollution.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'pollutionId',
  otherKey: 'userId',
  as: 'favoritedBy'
});

export { User, Pollution, Favorite };
