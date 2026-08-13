"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}
async function main() {
    console.log('🌱 Starting Database Seeding...');
    // 1. Feature Flags
    const flags = [
        { key: 'polling_enabled', description: 'Enable HTTP Polling Sources', isEnabled: true },
        { key: 'telegram_enabled', description: 'Enable Telegram Actions', isEnabled: true },
        { key: 'email_enabled', description: 'Enable SMTP Email Actions', isEnabled: true },
        { key: 'billing_enabled', description: 'Enable Subscription Billing Architecture', isEnabled: true },
        { key: 'demo_mode_enabled', description: 'Enable Interactive Demo Workspaces', isEnabled: true },
    ];
    for (const flag of flags) {
        await prisma.featureFlag.upsert({
            where: { key: flag.key },
            update: { isEnabled: flag.isEnabled, description: flag.description },
            create: flag,
        });
    }
    console.log('✅ Feature Flags Seeded');
    // 2. Admin & Demo User
    const passwordHash = await hashPassword('Admin123456!');
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@webhookplatform.io' },
        update: {},
        create: {
            email: 'admin@webhookplatform.io',
            fullName: 'System Owner',
            passwordHash,
            isEmailVerified: true,
        },
    });
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@webhookplatform.io' },
        update: {},
        create: {
            email: 'demo@webhookplatform.io',
            fullName: 'Demo Sandbox User',
            passwordHash,
            isEmailVerified: true,
        },
    });
    // 3. Admin & Demo Organizations
    const mainOrg = await prisma.organization.upsert({
        where: { slug: 'main-organization' },
        update: {},
        create: {
            name: 'Main Enterprise Org',
            slug: 'main-organization',
            isDemo: false,
        },
    });
    const demoOrg = await prisma.organization.upsert({
        where: { slug: 'demo-workspace' },
        update: {},
        create: {
            name: 'Demo Sandbox Workspace',
            slug: 'demo-workspace',
            isDemo: true,
        },
    });
    // 4. Organization Memberships
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: mainOrg.id,
                userId: adminUser.id,
            },
        },
        update: { role: client_1.RoleName.OWNER },
        create: {
            organizationId: mainOrg.id,
            userId: adminUser.id,
            role: client_1.RoleName.OWNER,
        },
    });
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: demoOrg.id,
                userId: demoUser.id,
            },
        },
        update: { role: client_1.RoleName.OPERATOR },
        create: {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            role: client_1.RoleName.OPERATOR,
        },
    });
    // 5. Subscriptions
    await prisma.subscription.create({
        data: {
            organizationId: mainOrg.id,
            planTier: client_1.PlanTier.ENTERPRISE,
            status: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma.subscription.create({
        data: {
            organizationId: demoOrg.id,
            planTier: client_1.PlanTier.FREE,
            status: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    });
    // 6. Demo & Sample Bots
    const demoBotPublicKey = 'demo-bot-12345';
    await prisma.bot.upsert({
        where: { publicKey: demoBotPublicKey },
        update: {},
        create: {
            organizationId: demoOrg.id,
            name: 'Automatic Hotel Booking Bot',
            description: 'Filters incoming booking webhooks for price <= 500 and sends automated notification',
            status: client_1.BotStatus.ACTIVE,
            mode: client_1.BotMode.DEMO,
            publicKey: demoBotPublicKey,
            payloadSchema: {
                price: 'number',
                status: 'string',
                itemId: 'string',
                customerEmail: 'string',
            },
            rules: {
                logicalOperator: 'AND',
                conditions: [
                    { field: 'price', operator: 'less_or_equal', value: 500 },
                    { field: 'status', operator: 'equals', value: 'available' },
                ],
            },
            actions: [
                {
                    type: 'HTTP_REQUEST',
                    name: 'Book Hotel Endpoint',
                    method: 'POST',
                    url: 'https://httpbin.org/post',
                    headers: { 'Content-Type': 'application/json' },
                    bodyTemplate: '{"bookingId":"{{event.itemId}}","confirmedPrice":{{event.price}}}',
                },
            ],
        },
    });
    console.log('🎉 Database Seeding Completed Successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map