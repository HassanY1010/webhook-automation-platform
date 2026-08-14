import { SourcesService } from './sources.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@webhook-auto/database';

jest.mock('@webhook-auto/database', () => ({
  prisma: {
    source: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    bot: {
      findFirst: jest.fn(),
    },
  },
  BotStatus: { ACTIVE: 'ACTIVE', PAUSED: 'PAUSED', DRAFT: 'DRAFT' },
  SourceType: { WEBHOOK: 'WEBHOOK', REST_API: 'REST_API' },
}));

describe('SourcesService Multi-Tenant Isolation & Security Suite', () => {
  let service: SourcesService;

  beforeEach(() => {
    service = new SourcesService();
    jest.clearAllMocks();
  });

  it('should enforce organizationId scoping when fetching a source by ID', async () => {
    (prisma.source.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.getSourceById('org_A', 'source_belonging_to_B'),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.source.findFirst).toHaveBeenCalledWith({
      where: { id: 'source_belonging_to_B', organizationId: 'org_A' },
      include: expect.any(Object),
    });
  });

  it('should reject creating a source linked to a bot belonging to another organization', async () => {
    (prisma.bot.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createSource('org_A', {
        name: 'Attacker Source',
        botId: 'bot_from_org_B',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create a source with encrypted HMAC secret and return raw secret once', async () => {
    (prisma.bot.findFirst as jest.Mock).mockResolvedValue({
      id: 'bot_A',
      organizationId: 'org_A',
    });
    (prisma.source.create as jest.Mock).mockResolvedValue({
      id: 'src_123',
      organizationId: 'org_A',
      botId: 'bot_A',
      name: 'Stripe Source',
      type: 'WEBHOOK',
      status: 'ACTIVE',
      publicKey: 'src_test_public_key',
      eventsCount: 0,
      createdAt: new Date(),
      bot: { id: 'bot_A', name: 'Billing Bot' },
    });

    const result = await service.createSource('org_A', {
      name: 'Stripe Source',
      botId: 'bot_A',
    });

    expect(result.source).toBeDefined();
    expect(result.source.name).toBe('Stripe Source');
    expect(result.secret).toBeDefined();
    expect(result.secret.startsWith('whsec_')).toBe(true);

    expect(prisma.source.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_A',
          secretEncrypted: expect.any(String),
        }),
      }),
    );
  });

  it('should toggle source status between ACTIVE and PAUSED', async () => {
    (prisma.source.findFirst as jest.Mock).mockResolvedValue({
      id: 'src_1',
      organizationId: 'org_A',
      status: 'ACTIVE',
    });
    (prisma.source.update as jest.Mock).mockResolvedValue({
      id: 'src_1',
      status: 'PAUSED',
    });

    const result = await service.toggleSourceStatus('org_A', 'src_1');
    expect(prisma.source.update).toHaveBeenCalledWith({
      where: { id: 'src_1' },
      data: { status: 'PAUSED' },
      include: expect.any(Object),
    });
  });
});
