import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { generateNanoId } from "../utils/generate-nano-id";

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeId: z.number(),
            ticketId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { name, email } = request.body;

      let ticketId = generateNanoId();

      const existingAttendee = await prisma.attendee.findUnique({
        where: {
          ticketId,
        },
      });

      if (existingAttendee !== null) {
        let newTicketId = generateNanoId();
        ticketId = newTicketId;
      }

      const attendeeFromSameEvent = await prisma.attendee.findUnique({
        where: {
          eventId_email: {
            eventId,
            email,
          },
        },
      });

      if (attendeeFromSameEvent !== null) {
        throw new Error(
          "Attendee with the same email already registered for this event"
        );
      }

      const [event, amountOfAttendeesForEvent] = await Promise.all([
        prisma.event.findUnique({
          where: {
            id: eventId,
          },
        }),
        prisma.attendee.count({
          where: {
            eventId,
          },
        }),
      ]);

      if (
        event?.maximumAttendees &&
        amountOfAttendeesForEvent >= event?.maximumAttendees
      ) {
        throw new Error("Maximum number of attendees reached for this event");
      }

      const attendees = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
          ticketId,
        },
      });

      return reply.status(201).send({
        attendeeId: attendees.id,
        ticketId,
      });
    }
  );
}
