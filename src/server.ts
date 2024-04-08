import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";

import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";
import { CheckIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import { errorHandler } from "./error-handler";
import { editAttendeeInfo } from "./routes/edit-attendee-info";
import { deleteAttendee } from "./routes/delete-attendee";
import { getAllEvents } from "./routes/get-all-events";
import { deleteEvent } from "./routes/delete-event";
import { getEventAttendeesBySlug } from "./routes/get-event-attendees-by-slug";
import { getEventBySlug } from "./routes/get-event-by-slug";

const app = fastify();

app.register(fastifyCors, {
  // TODO: Em produção, você deve especificar os domínios permitidos no front-end
  origin: "*",
});

app.register(fastifySwagger, {
  swagger: {
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "pass.in",
      description: "Especificações da API para o back-end da aplicação pass.in",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);

const routes = [
  { plugin: createEvent },
  { plugin: registerForEvent },
  { plugin: getEvent },
  { plugin: getAttendeeBadge },
  { plugin: CheckIn },
  { plugin: getEventAttendees },
  { plugin: editAttendeeInfo },
  { plugin: deleteAttendee },
  { plugin: getAllEvents },
  { plugin: deleteEvent },
  { plugin: getEventAttendeesBySlug },
  { plugin: getEventBySlug },
];

routes.forEach(({ plugin }) => app.register(plugin));

// Adicionando o host 0.0.0.0 para permitir conexões no React Native
app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("🎉 HTTP server is running\n👉 http://localhost:3333");
});
