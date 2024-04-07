import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getAllEvents(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events",
    {
      schema: {
        summary: "Get a list of all events",
        tags: ["Events"],
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              title: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().nullable(),
              currentAttendees: z.number(),
              price: z.number().nullable(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      const events = await prisma.event.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          _count: {
            select: {
              attendees: true,
            },
          },
          price: true,
        },
      });

      const formattedEvents = events.map((event) => ({
        id: event.id,
        title: event.title,
        slug: event.slug,
        details: event.details,
        maximumAttendees: event.maximumAttendees,
        currentAttendees: event._count.attendees,
        price: event.price,
      }));

      return reply.send(formattedEvents);
    }
  );
}
