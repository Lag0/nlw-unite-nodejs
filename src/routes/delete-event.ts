import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function deleteEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/events/:eventId",
    {
      schema: {
        summary: "Delete an event",
        tags: ["Events"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;

      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return reply.status(404).send({ message: "Event not found" });
      }

      await prisma.event.delete({
        where: { id: eventId },
      });

      return reply.status(204).send({ message: "Event deleted" });
    }
  );
}
