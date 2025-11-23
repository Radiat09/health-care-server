import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { prisma } from "../../utils/prisma";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorUpdateInput } from "./doctor.interface";

const getAllFromDB = async (filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialities, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    // "", "medicine"
    if (specialities && specialities.length > 0) {
        andConditions.push({
            doctorSpecialities: {
                some: {
                    specialities: {
                        title: {
                            contains: specialities,
                            mode: "insensitive"
                        }
                    }
                }
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))

        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctorSpecialities: {
                include: {
                    specialities: true
                }
            }
        }
    });

    const total = await prisma.doctor.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

// const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
//     const doctorInfo = await prisma.doctor.findUniqueOrThrow({
//         where: {
//             id
//         }
//     });

//     const { specialities, ...doctorData } = payload;

//     return await prisma.$transaction(async (tnx) => {
//         if (specialities && specialities.length > 0) {
//             const deleteSpecialtyIds = specialities.filter((speciality) => speciality.isDeleted);

//             for (const speciality of deleteSpecialtyIds) {
//                 await tnx.doctorSpecialities.deleteMany({
//                     where: {
//                         doctorId: id,
//                         specialitiesId: speciality.specialityId
//                     }
//                 })
//             }

//             const createSpecialtyIds = specialities.filter((specialty) => !specialty.isDeleted);

//             for (const speciality of createSpecialtyIds) {
//                 await tnx.doctorSpecialities.create({
//                     data: {
//                         doctorId: id,
//                         specialitiesId: speciality.specialityId
//                     }
//                 })
//             }

//         }

//         const updatedData = await tnx.doctor.update({
//             where: {
//                 id: doctorInfo.id
//             },
//             data: doctorData,
//             include: {
//                 doctorSpecialities: {
//                     include: {
//                         specialities: true
//                     }
//                 }
//             }

//             //  doctor - doctorSpecailties - specialities 
//         })

//         return updatedData
//     })


// }
const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: { id }
    });

    const { specialities, ...doctorData } = payload;

    return await prisma.$transaction(async (tnx) => {
        if (specialities && specialities.length > 0) {
            // Handle deletions
            const deleteSpecialityIds = specialities
                .filter((speciality) => speciality.isDeleted)


            for (const speciality of deleteSpecialityIds) {
                await tnx.doctorSpecialities.deleteMany({
                    where: {
                        doctorId: id,
                        specialitiesId: speciality.specialityId
                    }
                })
            }


            // Handle creations
            const createSpecialtyIds = specialities
                .filter((specialty) => !specialty.isDeleted)

            for (const speciality of createSpecialtyIds) {
                await tnx.doctorSpecialities.createMany({
                    data: {
                        doctorId: id,
                        specialitiesId: speciality.specialityId
                    }
                })
            }

        }

        const updatedData = await tnx.doctor.update({
            where: { id: doctorInfo.id },
            data: doctorData,
            include: {
                doctorSpecialities: {
                    include: {
                        specialities: true
                    }
                }
            }
        });

        return updatedData;
    });
};
export const DoctorService = {
    getAllFromDB,
    updateIntoDB
}