import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { generateSlug } from "../utils/generate-slug";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { BadRequest } from "./_errors/bad-request";

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        summary: "Create a new event",
        tags: ["Events"],
        body: z.object({
          title: z.string().min(4),
          details: z.string().min(4).optional(),
          maximumAttendees: z.number().int().positive().optional().nullable(),
          price: z.number().positive().optional().nullable(),
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
            title: z.string(),
            slug: z.string(),
            details: z.string().nullable(),
            maximumAttendees: z.number().nullable(),
            price: z.number().nullable(),
            createdAt: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, details, maximumAttendees, price } = request.body;

      const slug = generateSlug(title);
      const date = new Date();

      const eventWithSameSlug = await prisma.event.findUnique({
        where: { slug },
      });

      if (eventWithSameSlug) {
        throw new BadRequest("An event with the same slug already exists");
      }

      const event = await prisma.event.create({
        data: {
          title,
          slug,
          details: details,
          maximumAttendees: maximumAttendees,
          price: price,
          createdAt: date,
        },
      });

      return reply.status(201).send({
        id: event.id,
        title: event.title,
        slug: event.slug,
        details: event.details,
        maximumAttendees: event.maximumAttendees,
        price: event.price,
        createdAt: date,
      });
    }
  );
}
