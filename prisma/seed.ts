import { prisma } from "../src/lib/prisma";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

async function seed() {
  const eventId = "4d581edb-3f8c-4224-9182-c4398cfea080";

  await prisma.event.deleteMany();

  await prisma.event.create({
    data: {
      id: eventId,
      title: "Unite Summit",
      slug: "unite-summit",
      details: "Um evento p/ devs apaixonados(as) por código!",
      maximumAttendees: 120,
    },
  });

  const attendeesToInsert: Prisma.AttendeeUncheckedCreateInput[] = [];

  for (let i = 0; i <= 120; i++) {
    attendeesToInsert.push({
      id: 10000 + i,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      eventId,
      createdAt: faker.date.recent({
        days: 30,
        refDate: dayjs().subtract(8, "days").toDate(),
      }),
      checkIn: faker.helpers.arrayElement<
        Prisma.CheckInUncheckedCreateNestedOneWithoutAttendeeInput | undefined
      >([
        undefined,
        {
          create: {
            createdAt: faker.date.recent({ days: 7 }),
          },
        },
      ]),
      ticketId: "",
    });
  }

  await Promise.all(
    attendeesToInsert.map((data) => {
      return prisma.attendee.create({
        data,
      });
    })
  );
}

seed().then(() => {
  console.log("Database seeded!");
  prisma.$disconnect();
});
