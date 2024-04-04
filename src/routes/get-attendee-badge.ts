import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeeBadge(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:ticketId/badge",
    {
      schema: {
        summary: "Get a ticket-badge for an attendee",
        tags: ["Attendees"],
        params: z.object({
          ticketId: z.string().min(10).max(10),
        }),
        response: {
          200: z.object({
            badge: z.object({
              eventTitle: z.string(),
              id: z.number(),
              ticketId: z.string(),
              name: z.string(),
              email: z.string().email(),
              isCheckedIn: z.boolean(),
              checkInUrl: z.string().url(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { ticketId } = request.params;

      const attendee = await prisma.attendee.findUnique({
        select: {
          id: true,
          ticketId: true,
          name: true,
          email: true,
          isCheckedIn: true,
          event: {
            select: {
              title: true,
            },
          },
        },
        where: {
          ticketId: ticketId,
        },
      });

      if (attendee === null) {
        throw new BadRequest("Attendee not found"); //404
      }

      if (attendee.ticketId === null) {
        throw new BadRequest("Ticket ID is missing for attendee"); //404
      }

      const baseURL = `${request.protocol}://${request.hostname}`;
      const checkInUrl = new URL(
        `/attendees/${attendee.ticketId}/check-in`,
        baseURL
      );

      return reply.send({
        badge: {
          eventTitle: attendee.event.title,
          id: attendee.id,
          ticketId: attendee.ticketId,
          name: attendee.name,
          email: attendee.email,
          isCheckedIn: attendee.isCheckedIn ?? false,
          checkInUrl: checkInUrl.toString(),
        },
      });
    }
  );
}
