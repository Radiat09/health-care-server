import { Prisma, PrismaClient } from '@prisma/client';

export class QueryBuilder<TModel extends PrismaModel, TWhereInput = any, TSelectInput = any> {
  private prisma: PrismaClient;
  private model: TModel;
  private query: Record<string, any>;
  private whereConditions: TWhereInput[] = [];
  private orderBy: Record<string, 'asc' | 'desc'> = {};
  private selectFields: TSelectInput | undefined;
  private skip: number = 0;
  private limit: number = 10;
  private page: number = 1;

  constructor(prisma: PrismaClient, model: TModel, query: Record<string, any>) {
    this.prisma = prisma;
    this.model = model;
    this.query = query;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm;

    if (searchTerm) {
      const searchCondition = {
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        })),
      } as TWhereInput;

      this.whereConditions.push(searchCondition);
    }

    return this;
  }

  filter(): this {
    const { searchTerm, page, limit, sortBy, sortOrder, fields, ...filterData } = this.query;

    if (Object.keys(filterData).length > 0) {
      const filterCondition = {
        AND: Object.keys(filterData).map((key) => ({
          [key]: {
            equals: filterData[key],
          },
        })),
      } as TWhereInput;

      this.whereConditions.push(filterCondition);
    }

    return this;
  }

  advancedFilter(customFilters: Record<string, any>): this {
    if (customFilters && Object.keys(customFilters).length > 0) {
      this.whereConditions.push(customFilters as TWhereInput);
    }
    return this;
  }

  sort(defaultSortBy: string = 'createdAt', defaultSortOrder: 'asc' | 'desc' = 'desc'): this {
    const sortBy = this.query.sortBy || defaultSortBy;
    const sortOrder = this.query.sortOrder || defaultSortOrder;

    this.orderBy = {
      [sortBy]: sortOrder,
    };

    return this;
  }

  fields(): this {
    const fields = this.query.fields;

    if (fields) {
      const fieldArray = fields.split(',');
      const select: Record<string, boolean> = {};

      fieldArray.forEach((field: string) => {
        const trimmedField = field.trim();
        // Basic validation - you can add more specific validation per model if needed
        if (trimmedField && !trimmedField.includes(' ')) {
          select[trimmedField] = true;
        }
      });

      if (Object.keys(select).length > 0) {
        this.selectFields = select as TSelectInput;
      }
    }

    return this;
  }

  paginate(defaultPage: number = 1, defaultLimit: number = 10): this {
    this.page = Number(this.query.page) || defaultPage;
    this.limit = Number(this.query.limit) || defaultLimit;
    this.skip = (this.page - 1) * this.limit;

    return this;
  }

  private buildWhere(): TWhereInput | undefined {
    if (this.whereConditions.length === 0) {
      return undefined;
    }

    if (this.whereConditions.length === 1) {
      return this.whereConditions[0];
    }

    return {
      AND: this.whereConditions,
    } as TWhereInput;
  }

  async build(): Promise<any[]> {
    const where = this.buildWhere();

    const findManyArgs: any = {
      skip: this.skip,
      take: this.limit,
      where,
      orderBy: this.orderBy,
    };

    if (this.selectFields) {
      findManyArgs.select = this.selectFields;
    }

    return await this.model.findMany(findManyArgs);
  }

  async getMeta(): Promise<{
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  }> {
    const where = this.buildWhere();

    const total = await this.model.count({
      where,
    });

    const totalPage = Math.ceil(total / this.limit);

    return {
      page: this.page,
      limit: this.limit,
      total,
      totalPage,
    };
  }
}

// Type definitions
type PrismaModel = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
};
