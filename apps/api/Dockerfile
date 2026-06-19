FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl ca-certificates libc6-compat
COPY package.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm install --workspace apps/api --include-workspace-root

FROM deps AS build
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl ca-certificates libc6-compat
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
WORKDIR /app/apps/api
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
