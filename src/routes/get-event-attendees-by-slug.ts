import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

// TODO: ? Maybe use Check-In as a boolean to check if the attendee has checked in or not
// TODO: ? Also, add a query parameter to filter attendees by checked in status

export async function getEventAttendeesBySlug(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/slug/:slug/attendees",
    {
      schema: {
        summary: "Get all attendees of an event by slug",
        tags: ["Events"],
        params: z.object({
          slug: z.string(),
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
                isCheckedIn: z.boolean(),
                checkInDate: z.date().nullable(),
              })
            ),
            total: z.number(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { pageIndex, query } = request.query;

      const event = await prisma.event.findUnique({
        where: { slug },
      });

      if (event === null) {
        return reply.status(404).send({ message: "Event not found" });
      }

      const [attendees, total] = await Promise.all([
        prisma.attendee.findMany({
          select: {
            id: true,
            ticketId: true,
            name: true,
            email: true,
            createdAt: true,
            isCheckedIn: true,
            checkInDate: true,
          },
          where: {
            eventId: event.id,
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
            eventId: event.id,
            name: {
              contains: query ? query : undefined,
              mode: "insensitive",
            },
          },
        }),
      ]);

      return reply.send({
        attendees: attendees.map((attendee) => ({
          id: attendee.id,
          ticketId: attendee.ticketId,
          name: attendee.name,
          email: attendee.email,
          createdAt: attendee.createdAt,
          isCheckedIn: attendee.isCheckedIn,
          checkInDate: attendee.checkInDate,
        })),
        total,
      });
    }
  );
}
