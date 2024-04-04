import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";
import { parseISO, isValid } from "date-fns";

export async function editAttendeeInfo(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/attendees/:ticketId/edit",
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
          checkInDate: z.string().optional(),
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
              checkInDate: z.date().nullish(),
            }),
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

      if (!currentAttendee) {
        throw new BadRequest("Attendee not found");
      }

      if (email && email !== currentAttendee.email) {
        const emailInUse = await prisma.attendee.findMany({
          where: {
            email,
            NOT: { ticketId },
          },
        });
        if (emailInUse.length > 0) {
          throw new BadRequest("Email already exists");
        }
      }

      let parsedCheckInDate;
      if (checkInDate) {
        parsedCheckInDate = parseISO(checkInDate);
        if (!isValid(parsedCheckInDate)) {
          throw new BadRequest("Invalid check-in date format");
        }
      }

      await prisma.attendee.update({
        where: { ticketId },
        data: {
          name: name ?? currentAttendee.name,
          email: email ?? currentAttendee.email,
          isCheckedIn: isCheckedIn ?? currentAttendee.isCheckedIn,
          checkInDate: isCheckedIn ? parsedCheckInDate : null,
        },
      });

      reply.status(200).send({
        message: "Attendee updated successfully",
        attendee: {
          ticketId,
          name: name ?? currentAttendee.name,
          email: email ?? currentAttendee.email,
          createdAt: currentAttendee.createdAt,
          isCheckedIn: isCheckedIn ?? currentAttendee.isCheckedIn,
          checkInDate: isCheckedIn ? parsedCheckInDate : null,
        },
      });
    }
  );
}
