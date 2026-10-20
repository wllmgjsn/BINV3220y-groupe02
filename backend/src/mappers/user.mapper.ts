import type { User, UserDbo, UserDto } from "../models/user.ts";

export const toUser = (dbo: UserDbo): User => ({
  kind: dbo.kind,
  id: dbo.person.id,
  firstName: dbo.person.first_name,
  lastName: dbo.person.last_name,
  email: dbo.person.email,
  roles: dbo.roles.map((row) => row.role),
  companies: dbo.companies.map((company) => ({ id: company.id, shortName: company.short_name })),
});

export const toUserDto = (user: User): UserDto => ({
  kind: user.kind,
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  roles: [...user.roles],
  companies: user.companies.map((company) => ({ id: company.id, shortName: company.shortName })),
});
