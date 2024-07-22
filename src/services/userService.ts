import { Role, User } from "@prisma/client";
import { UserModel } from "../database/Users";
import { USER_FIELD_SELECT } from "../config";

interface Filters {
  search?: string;
  isActive?: boolean;
  role?: Role;
  skip: number;
  take: number;
}

export const getUsersWithQuery = async (filters: Filters) => {
  const { search = "", isActive, role, skip, take } = filters;

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
              { userName: { contains: search } },
            ],
          },
          isActive ? { isActive: isActive } : {},
          role ? { role: role } : {},
        ],
      },
      select: USER_FIELD_SELECT.COMMON,
    }),
    UserModel.count({
      where: {
        AND: [
          {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { userName: { contains: search } },
            ],
          },
          isActive ? { isActive: isActive } : {},
          role ? { role: role } : {},
        ],
      },
    }),
  ]);
  return { users, count };
};
