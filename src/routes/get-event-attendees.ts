import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

// TODO: ? Maybe use Check-In as a boolean to check if the attendee has checked in or not
// TODO: ? Also, add a query parameter to filter attendees by checked in status

export async function getEventAttendees(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Get all attendees of an event",
        tags: ["Events"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        querystring: z.object({
          query: z.string().nullish(),
          pageIndex: z.string().nullish().default("0").transform(Number),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number(),
                ticketId: z.string(),
                name: z.string(),
                email: z.string().email(),
                createdAt: z.date(),
                checkedInAt: z.date().nullable(),
              })
            ),
            total: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { pageIndex, query } = request.query;

      const [eventExists, attendees, total] = await Promise.all([
        prisma.event.findUnique({
          where: {
            id: eventId,
          },
        }),
        prisma.attendee.findMany({
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
          where: {
            eventId,
            name: {
              contains: query ? query : undefined,
              mode: "insensitive",
            },
          },
          take: 10,
          skip: pageIndex * 10,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.attendee.count({
          where: {
            eventId,
            name: {
              contains: query ? query : undefined,
              mode: "insensitive",
            },
          },
        }),
      ]);

      if (eventExists === null) {
        throw new BadRequest("Event not found");
      }

      return reply.send({
        attendees: attendees.map((attendee) => {
          return {
            id: attendee.id,
            ticketId: attendee.ticketId,
            name: attendee.name,
            email: attendee.email,
            createdAt: attendee.createdAt,
            checkedInAt: attendee.checkIn?.createdAt ?? null,
          };
        }),
        total,
      });
    }
  );
}
