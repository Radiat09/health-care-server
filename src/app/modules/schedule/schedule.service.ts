import { PrismaClient } from '@prisma/client';
import { addHours, addMinutes, format } from 'date-fns';
import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { BaseService } from '../../utils/BaseService';

export class ScheduleServiceClass extends BaseService<'schedule'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'schedule', ['startDateTime', 'endDateTime']);
  }

  async create(payload: {
    startTime: string;
    endTime: string;
    startDate: string | Date;
    endDate: string | Date;
  }) {
    const { startTime, endTime, startDate, endDate } = payload;

    const intervalTime = 30;
    const schedules = [];

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const dayStartDateTime = new Date(
        addMinutes(addHours(`${format(currentDate, 'yyyy-MM-dd')}`, startHours), startMinutes),
      );

      const dayEndDateTime = new Date(
        addMinutes(addHours(`${format(currentDate, 'yyyy-MM-dd')}`, endHours), endMinutes),
      );

      let slotStartDateTime = new Date(dayStartDateTime);

      while (slotStartDateTime < dayEndDateTime) {
        const slotEndDateTime = addMinutes(slotStartDateTime, intervalTime);

        const scheduleData = {
          startDateTime: slotStartDateTime,
          endDateTime: slotEndDateTime,
        };

        const existingSchedule = await this.prisma.schedule.findFirst({
          where: scheduleData,
        });

        if (!existingSchedule) {
          const result = await this.prisma.schedule.create({
            data: scheduleData,
          });
          schedules.push(result);
        }

        slotStartDateTime = addMinutes(slotStartDateTime, intervalTime);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
  }

  async schedulesForDoctor(
    user: JwtPayload,
    filters: { startDateTime?: Date; endDateTime?: Date },
    options: any,
  ) {
    const doctorSchedules = await this.prisma.doctorSchedules.findMany({
      where: {
        doctor: {
          email: user.email,
        },
      },
      select: {
        scheduleId: true,
      },
    });

    const doctorScheduleIds = doctorSchedules.map((schedule) => schedule.scheduleId);

    const customFilters = {
      id: { notIn: doctorScheduleIds },
      ...(filters.startDateTime &&
        filters.endDateTime && {
        AND: [
          { startDateTime: { gte: filters.startDateTime } },
          { endDateTime: { lte: filters.endDateTime } },
        ],
      }),
    };

    return this.getAllFromDBWithAdvancedFilter(options, customFilters);
  }
}


export const scheduleService = new ScheduleServiceClass(prisma);
