import { Specialities } from '@prisma/client';
import { Request } from 'express';
import { prisma } from '../../utils/prisma';

const inserIntoDB = async (req: Request) => {
  const file = req.file;

  if (file) {
    req.body.icon = file?.path;
  }

  const result = await prisma.specialities.create({
    data: req.body,
  });

  return result;
};

const getAllFromDB = async (): Promise<Specialities[]> => {
  return await prisma.specialities.findMany();
};

const deleteFromDB = async (id: string): Promise<Specialities> => {
  const result = await prisma.specialities.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesService = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
