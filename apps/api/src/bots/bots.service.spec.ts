import { BotsService } from './bots.service';
import { NotFoundException } from '@nestjs/common';
import { prisma } from '@webhook-auto/database';

jest.mock('@webhook-auto/database', () => ({
  prisma: {
    bot: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    botVersion: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
  BotMode: { LIVE: 'LIVE', TEST: 'TEST', DRY_RUN: 'DRY_RUN' },
  BotStatus: { ACTIVE: 'ACTIVE', PAUSED: 'PAUSED', DRAFT: 'DRAFT' },
}));

describe('BotsService Multi-Tenant Isolation & BOLA Forensic Suite', () => {
  let service: BotsService;

  beforeEach(() => {
    service = new BotsService();
    jest.clearAllMocks();
  });

  it('should enforce organizationId scoping when fetching a bot by ID', async () => {
    (prisma.bot.findFirst as jest.Mock).mockResolvedValue(null);

    // Attempt to access Bot B belonging to Org B using Org A credentials
    await expect(service.getBotById('org_A', 'bot_B')).rejects.toThrow(NotFoundException);

    expect(prisma.bot.findFirst).toHaveBeenCalledWith({
      where: { id: 'bot_B', organizationId: 'org_A' },
      include: expect.any(Object),
    });
  });

  it('should list only bots belonging to the caller organization', async () => {
    (prisma.bot.findMany as jest.Mock).mockResolvedValue([
      { id: 'bot_A1', organizationId: 'org_A', name: 'Bot 1' },
    ]);
    (prisma.bot.count as jest.Mock).mockResolvedValue(1);

    const result = await service.getBots('org_A', 1, 10);

    expect(result.bots).toHaveLength(1);
    expect(result.bots[0].id).toBe('bot_A1');
    expect(prisma.bot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org_A' },
      })
    );
  });
});
