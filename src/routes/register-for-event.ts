import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { generateNanoId } from "../utils/generate-nano-id";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Register an attendee in a event",
        tags: ["Attendees"],
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
            name: z.string(),
            email: z.string().email(),
            createdAt: z.date(),
            isCheckedIn: z.boolean(),
            checkInDate: z.date().nullable(),
          }),
          403: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { name, email } = request.body;

      let ticketId = await generateNanoId();

      const existingAttendee = await prisma.attendee.findUnique({
        where: {
          ticketId,
        },
      });

      if (existingAttendee !== null) {
        let newTicketId = await generateNanoId();
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
        return reply.status(409).send({
          message:
            "Attendee with the same e-mail already registered for this event",
        }); //409
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
        return reply.status(403).send({
          message: "Maximum number of attendees reached for this event",
        });
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
        name: attendees.name,
        email: attendees.email,
        createdAt: attendees.createdAt,
        isCheckedIn: attendees.isCheckedIn,
        checkInDate: attendees.checkInDate,
      });
    }
  );
}
