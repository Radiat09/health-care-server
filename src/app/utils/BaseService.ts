import { PrismaClient } from "@prisma/client";
import { QueryBuilder } from "./QueryBuilder";
import bcrypt from "bcryptjs";
import { envVars } from "../config/env";

// Use PrismaClient directly instead of PrismaService
type PrismaClientModels = {
  [K in keyof PrismaClient]: K extends symbol ? never : K;
}[keyof PrismaClient];

export type ModelName = Exclude<PrismaClientModels, `$${string}`>;

export abstract class BaseService<T extends ModelName> {
  constructor(
    protected readonly prisma: PrismaClient, // Use PrismaClient directly
    protected readonly model: T,
    protected readonly searchableFields: string[]
  ) {}
  // Add validation that the model exists
  protected get modelDelegate() {
    const delegate = (this.prisma as any)[this.model];
    if (!delegate) {
      throw new Error(`Model '${this.model}' not found in Prisma client`);
    }
    return delegate;
  }

  async getAllFromDB(query: any) {
    // const modelDelegate = this.prisma[this.model] as any;

    const queryBuilder = new QueryBuilder(
      this.prisma,
      this.modelDelegate,
      query
    );

    const [data, meta] = await Promise.all([
      queryBuilder
        .filter()
        .search(this.searchableFields)
        .sort()
        .fields()
        .paginate()
        .build(),
      queryBuilder.getMeta(),
    ]);

    return { meta, data };
  }

  // Add other common methods like getById, create, update, delete
  async getById(id: string) {
    return this.modelDelegate.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.modelDelegate.create({ data });
  }

  async update(id: string, data: any) {
    return this.modelDelegate.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.modelDelegate.delete({ where: { id } });
  }
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUND));
  }
}
