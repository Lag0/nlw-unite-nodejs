import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getEventBySlug(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/slug/:slug",
    {
      schema: {
        summary: "Get details of an event by slug",
        tags: ["Events"],
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().nullable(),
              currentAttendees: z.number(),
              price: z.number().nullable(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      const event = await prisma.event.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          price: true,
          createdAt: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });

      if (event === null) {
        throw new BadRequest("Event not found"); // 404
      }

      return reply.send({
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          details: event.details,
          maximumAttendees: event.maximumAttendees,
          currentAttendees: event._count.attendees,
          price: event.price,
          createdAt: event.createdAt,
        },
      });
    }
  );
}
