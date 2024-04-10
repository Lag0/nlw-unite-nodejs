import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function CheckIn(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:ticketId/check-in",
    {
      schema: {
        summary: "Check in an attendee to an event",
        tags: ["Check-Ins"],
        params: z.object({
          ticketId: z.string().min(10).max(10),
        }),
        response: {
          201: z.object({
            message: z.string(),
            attendee: z.object({
              ticketId: z.string(),
              name: z.string(),
              email: z.string().email(),
              isCheckedIn: z.boolean(),
              checkInDate: z.date().nullable(),
            }),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { ticketId } = request.params;

      const attendeeCheckIn = await prisma.attendee.findUnique({
        where: {
          ticketId: ticketId,
        },
      });

      if (attendeeCheckIn?.isCheckedIn === true) {
        return reply.status(409).send({
          message: "Attendee already checked in",
        });
      }

      const attendeeUpdated = await prisma.attendee.update({
        where: { ticketId },
        data: {
          isCheckedIn: true,
          checkInDate: new Date(),
        },
      });

      return reply.code(201).send({
        message: "Attendee checked in",
        attendee: {
          ticketId: attendeeUpdated.ticketId,
          name: attendeeUpdated.name,
          email: attendeeUpdated.email,
          isCheckedIn: attendeeUpdated.isCheckedIn,
          checkInDate: attendeeUpdated.checkInDate,
        },
      });
    }
  );
}
