import { Role, User } from "@prisma/client";
import { UserModel } from "../database/Users";

interface Filters {
  search?: string;
  isActive?: boolean;
  Role?: Role;
  skip: number;
  take: number;
}

export const getUsersWithQuery = async (filters: Filters) => {
  const { search = "", isActive, Role, skip, take } = filters;

  const [users, count] = await Promise.all([
    UserModel.findMany({
      skip,
      take,
      where: {
        AND: [
          {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { username: { contains: search } },
            ],
          },
          isActive ? { isActive: isActive } : {},
          Role ? { Role: Role } : {},
        ],
      },
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
        username: true,
        avatar: true,
        Role: true,
        isActive: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    UserModel.count({
      where: {
        AND: [
          {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { username: { contains: search } },
            ],
          },
          isActive ? { isActive: isActive } : {},
          Role ? { Role: Role } : {},
        ],
      },
    }),
  ]);
  return { users, count };
};
