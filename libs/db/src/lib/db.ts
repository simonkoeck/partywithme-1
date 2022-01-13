import { PrismaClient } from '@prisma/client';

export const client = new PrismaClient();

export const user = client.user;
export const party = client.party;
export const passwordReset = client.passwordReset;
export const friendRequest = client.friendRequest;
export const friendship = client.friendship;
export const partyParticipation = client.partyParticipation;

export * from '.prisma/client';
