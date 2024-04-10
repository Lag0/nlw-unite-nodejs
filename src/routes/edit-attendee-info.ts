import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";
import { parseISO, isValid } from "date-fns";

export async function editAttendeeInfo(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/attendees/:ticketId",
    {
      schema: {
        summary: "Edit attendee's info",
        tags: ["Attendees"],
        params: z.object({
          ticketId: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          isCheckedIn: z.boolean().optional(),
          checkInDate: z.string().optional().nullable(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            attendee: z.object({
              ticketId: z.string(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.date(),
              isCheckedIn: z.boolean(),
              checkInDate: z.date().nullable(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const { name, email, isCheckedIn, checkInDate } = request.body;

      const currentAttendee = await prisma.attendee.findUnique({
        where: { ticketId },
      });

      if (!currentAttendee)
        return reply.status(404).send({ message: "Attendee not found" });

      if (email && email !== currentAttendee.email) {
        const emailExists = await prisma.attendee.count({
          where: { email, NOT: { ticketId } },
        });
        if (emailExists)
          return reply.status(409).send({ message: "Email already in use" });
      }

      let parsedCheckInDate = null;
      if (isCheckedIn) {
        parsedCheckInDate =
          checkInDate && isValid(parseISO(checkInDate))
            ? parseISO(checkInDate)
            : new Date();
      }

      const updatedAttendee = await prisma.attendee.update({
        where: { ticketId },
        data: {
          name: name ?? undefined,
          email: email ?? undefined,
          isCheckedIn,
          checkInDate: isCheckedIn ? parsedCheckInDate : null,
        },
      });

      reply.status(200).send({
        message: "Attendee information updated successfully",
        attendee: {
          ticketId: updatedAttendee.ticketId,
          name: updatedAttendee.name,
          email: updatedAttendee.email,
          createdAt: updatedAttendee.createdAt,
          isCheckedIn: updatedAttendee.isCheckedIn,
          checkInDate: updatedAttendee.checkInDate,
        },
      });
    }
  );
}
