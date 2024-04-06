import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function deleteAttendee(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/attendees/:ticketId",
    {
      schema: {
        summary: "Delete an attendee",
        tags: ["Attendees"],
        params: z.object({
          ticketId: z.string(),
        }),
        response: {
          204: z.object({}),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { ticketId } = request.params;

      try {
        const attendee = await prisma.attendee.findUnique({
          where: { ticketId },
        });

        if (!attendee) {
          return reply.status(404).send({ message: "Attendee not found" });
        }

        await prisma.attendee.delete({
          where: { ticketId },
        });

        return reply.status(204).send();
      } catch (error) {
        request.log.error(error, "Failed to delete attendee");
        return reply.status(500).send({ message: "Internal Server Error" });
      }
    }
  );
}
