import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";
import { parseISO, isValid } from "date-fns";

export async function editAttendeeInfo(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/attendees/:ticketId/edit",
    {
      schema: {
        summary: "Edit attendees info",
        tags: ["Attendees"],
        params: z.object({
          ticketId: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          createdAt: z.string().optional(),
          checkedInAt: z.string().optional().nullish(),
        }),
        response: {
          200: z.object({
            message: z.string().optional(),
            attendee: z.object({
              ticketId: z.string(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.date(),
              checkedInAt: z.date().nullish(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const { name, email, checkedInAt, createdAt } = request.body;

      const currentAttendee = await prisma.attendee.findUnique({
        where: { ticketId },
        select: {
          id: true,
          ticketId: true,
          name: true,
          email: true,
          createdAt: true,
          checkIn: {
            select: {
              createdAt: true,
            },
          },
        },
      });

      if (currentAttendee === null) {
        throw new BadRequest("Attendee not found");
      }

      if (email) {
        const attendeeEmailExists = await prisma.attendee.findFirst({
          where: { email },
        });

        if (attendeeEmailExists) {
          throw new BadRequest("Email already exists");
        }
      }

      if (checkedInAt === null && currentAttendee.checkIn) {
        await prisma.checkIn.delete({
          where: { ticketId },
        });
      }

      const createdAtDate = createdAt ? parseISO(createdAt) : undefined;
      const checkedInAtDate = checkedInAt ? parseISO(checkedInAt) : undefined;

      if (createdAt && !isValid(createdAtDate)) {
        throw new BadRequest("Invalid date format for createdAt");
      }

      if (checkedInAt && !isValid(checkedInAtDate)) {
        throw new BadRequest("Invalid date format for checkedInAt");
      }

      if (checkedInAtDate && createdAtDate && createdAtDate > checkedInAtDate) {
        throw new BadRequest(
          "createdAt date should be before checkedInAt date"
        );
      }

      const updatedAttendee = await prisma.attendee.update({
        where: { ticketId },
        data: {
          name: name ?? currentAttendee.name,
          email: email ?? currentAttendee.email,
          createdAt: createdAt ?? currentAttendee.createdAt,
          checkIn: {
            update: {
              createdAt: checkedInAt ?? currentAttendee.checkIn?.createdAt,
            },
          },
        },
      });

      return reply.code(200).send({
        attendee: {
          ticketId: updatedAttendee.ticketId,
          name: updatedAttendee.name,
          email: updatedAttendee.email,
          createdAt: createdAtDate || currentAttendee.createdAt,
          checkedInAt:
            checkedInAtDate || currentAttendee.checkIn?.createdAt || null,
        },
      });
    }
  );
}
