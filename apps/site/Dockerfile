FROM node:16-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src
COPY package.json package-lock.json ./ 
RUN npm install

FROM node:16-alpine AS builder
WORKDIR /usr/src
COPY --from=deps /usr/src/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM node:16-alpine AS runner
WORKDIR /usr/src

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/next.config.js ./
COPY --from=builder /usr/src/package.json ./package.json
COPY --from=deps /usr/src/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /usr/src/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /usr/src/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
