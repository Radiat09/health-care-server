import { PrismaClient } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { BaseService } from '../../utils/BaseService';

class DoctorScheduleServiceClass extends BaseService<'doctorSchedules'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'doctorSchedules', ['createdAt']);
  }

  async insertIntoDB(
    user: JwtPayload,
    payload: {
      scheduleIds: string[];
    },
  ) {
    // Get doctor data by email (since they're linked by email in your schema)
    const doctorData = await this.prisma.doctor.findUnique({
      where: {
        email: user.email, // Use email since that's the relation field
      },
    });

    if (!doctorData) {
      throw new Error(
        `Doctor profile not found for email: ${user.email}. ` +
          `Please complete your doctor registration first.`,
      );
    }

    // Prepare doctor schedule data
    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId,
    }));

    // Check if any schedules are already assigned to prevent duplicates
    const existingSchedules = await this.modelDelegate.findMany({
      where: {
        doctorId: doctorData.id,
        scheduleId: {
          in: payload.scheduleIds,
        },
      },
    });

    if (existingSchedules.length > 0) {
      const existingIds = existingSchedules.map(
        (schedule: { scheduleId: string; doctorId: string }) => schedule.scheduleId,
      );
      throw new Error(`Some schedules are already assigned: ${existingIds.join(', ')}`);
    }

    return await this.modelDelegate.createMany({
      data: doctorScheduleData,
    });
  }
}
const prisma = new PrismaClient();
export const doctorScheduleService = new DoctorScheduleServiceClass(prisma);
