import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { generateSlug } from "../utils/generate-slug";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        body: z.object({
          title: z.string().min(4),
          details: z.string().min(4).nullable().optional(),
          maximumAttendees: z.number().int().positive().nullable().optional(),
          price: z.number().nullable().optional(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, details, maximumAttendees, price } = request.body;

      const slug = generateSlug(title);

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug,
        },
      });

      if (eventWithSameSlug !== null) {
        throw new Error("An event with the same slug already exists");
      }

      const event = await prisma.event.create({
        data: {
          title,
          details,
          maximumAttendees,
          price: price ?? 0,
          slug: slug,
        },
      });

      return reply.status(201).send({ eventId: event.id });
    }
  );
}
