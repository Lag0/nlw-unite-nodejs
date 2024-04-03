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
        tags: ["Attendees"],
        params: z.object({
          ticketId: z.string().min(10).max(10),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { ticketId } = request.params;

      const attendeeCheckIn = await prisma.checkIn.findUnique({
        where: {
          ticketId: ticketId,
        },
      });

      if (attendeeCheckIn !== null) {
        throw new BadRequest("Attendee has already checked in");
      }

      await prisma.checkIn.create({
        data: {
          ticketId,
        },
      });

      return reply.code(201).send();
    }
  );
}
