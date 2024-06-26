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
        querystring: z.object({
          query: z.string().nullish(),
          pageIndex: z.string().nullish().default("0").transform(Number),
        }),
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
              createdAt: z.date(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      const { pageIndex, query } = request.query;

      const events = await prisma.event.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          createdAt: true,
          _count: {
            select: {
              attendees: true,
            },
          },
          price: true,
        },
        where: {
          title: {
            contains: query ? query : undefined,
            mode: "insensitive",
          },
        },
        take: 10,
        skip: pageIndex * 10,
        orderBy: {
          createdAt: "desc",
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
        createdAt: event.createdAt,
      }));

      return reply.send(formattedEvents);
    }
  );
}
