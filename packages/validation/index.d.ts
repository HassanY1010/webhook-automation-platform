import { z } from 'zod';
import { RuleOperator, BotMode, ActionType, SourceType } from '@webhook-auto/types';
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    organizationName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    fullName: string;
    password: string;
    organizationName: string;
}, {
    email: string;
    fullName: string;
    password: string;
    organizationName: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const ConditionSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodNativeEnum<typeof RuleOperator>;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    field: string;
    operator: RuleOperator;
    value?: any;
}, {
    field: string;
    operator: RuleOperator;
    value?: any;
}>;
export declare const RuleGroupSchema: z.ZodType<any>;
export declare const ActionConfigSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof ActionType>;
    name: z.ZodString;
    method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
    url: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bodyTemplate: z.ZodOptional<z.ZodString>;
    telegramChatId: z.ZodOptional<z.ZodString>;
    telegramMessageTemplate: z.ZodOptional<z.ZodString>;
    emailTo: z.ZodOptional<z.ZodString>;
    emailSubject: z.ZodOptional<z.ZodString>;
    emailBodyTemplate: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    retryPolicy: z.ZodOptional<z.ZodObject<{
        maxAttempts: z.ZodDefault<z.ZodNumber>;
        backoffMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxAttempts: number;
        backoffMs: number;
    }, {
        maxAttempts?: number | undefined;
        backoffMs?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: ActionType;
    timeoutMs: number;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
    url?: string | undefined;
    headers?: Record<string, string> | undefined;
    bodyTemplate?: string | undefined;
    telegramChatId?: string | undefined;
    telegramMessageTemplate?: string | undefined;
    emailTo?: string | undefined;
    emailSubject?: string | undefined;
    emailBodyTemplate?: string | undefined;
    retryPolicy?: {
        maxAttempts: number;
        backoffMs: number;
    } | undefined;
}, {
    name: string;
    type: ActionType;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
    url?: string | undefined;
    headers?: Record<string, string> | undefined;
    bodyTemplate?: string | undefined;
    telegramChatId?: string | undefined;
    telegramMessageTemplate?: string | undefined;
    emailTo?: string | undefined;
    emailSubject?: string | undefined;
    emailBodyTemplate?: string | undefined;
    timeoutMs?: number | undefined;
    retryPolicy?: {
        maxAttempts?: number | undefined;
        backoffMs?: number | undefined;
    } | undefined;
}>;
export declare const CreateBotSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    mode: z.ZodDefault<z.ZodNativeEnum<typeof BotMode>>;
    sourceType: z.ZodDefault<z.ZodNativeEnum<typeof SourceType>>;
    payloadSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    rules: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
    actions: z.ZodArray<z.ZodObject<{
        type: z.ZodNativeEnum<typeof ActionType>;
        name: z.ZodString;
        method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
        url: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        bodyTemplate: z.ZodOptional<z.ZodString>;
        telegramChatId: z.ZodOptional<z.ZodString>;
        telegramMessageTemplate: z.ZodOptional<z.ZodString>;
        emailTo: z.ZodOptional<z.ZodString>;
        emailSubject: z.ZodOptional<z.ZodString>;
        emailBodyTemplate: z.ZodOptional<z.ZodString>;
        timeoutMs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        retryPolicy: z.ZodOptional<z.ZodObject<{
            maxAttempts: z.ZodDefault<z.ZodNumber>;
            backoffMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxAttempts: number;
            backoffMs: number;
        }, {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: ActionType;
        timeoutMs: number;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        retryPolicy?: {
            maxAttempts: number;
            backoffMs: number;
        } | undefined;
    }, {
        name: string;
        type: ActionType;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        timeoutMs?: number | undefined;
        retryPolicy?: {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    mode: BotMode;
    sourceType: SourceType;
    actions: {
        name: string;
        type: ActionType;
        timeoutMs: number;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        retryPolicy?: {
            maxAttempts: number;
            backoffMs: number;
        } | undefined;
    }[];
    description?: string | undefined;
    payloadSchema?: Record<string, any> | undefined;
    rules?: any;
}, {
    name: string;
    actions: {
        name: string;
        type: ActionType;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        timeoutMs?: number | undefined;
        retryPolicy?: {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
        } | undefined;
    }[];
    description?: string | undefined;
    mode?: BotMode | undefined;
    sourceType?: SourceType | undefined;
    payloadSchema?: Record<string, any> | undefined;
    rules?: any;
}>;
export declare const UpdateBotSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    mode: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof BotMode>>>;
    sourceType: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof SourceType>>>;
    payloadSchema: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodNativeEnum<typeof ActionType>;
        name: z.ZodString;
        method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
        url: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        bodyTemplate: z.ZodOptional<z.ZodString>;
        telegramChatId: z.ZodOptional<z.ZodString>;
        telegramMessageTemplate: z.ZodOptional<z.ZodString>;
        emailTo: z.ZodOptional<z.ZodString>;
        emailSubject: z.ZodOptional<z.ZodString>;
        emailBodyTemplate: z.ZodOptional<z.ZodString>;
        timeoutMs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        retryPolicy: z.ZodOptional<z.ZodObject<{
            maxAttempts: z.ZodDefault<z.ZodNumber>;
            backoffMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxAttempts: number;
            backoffMs: number;
        }, {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: ActionType;
        timeoutMs: number;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        retryPolicy?: {
            maxAttempts: number;
            backoffMs: number;
        } | undefined;
    }, {
        name: string;
        type: ActionType;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        timeoutMs?: number | undefined;
        retryPolicy?: {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
        } | undefined;
    }>, "many">>;
} & {
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "PAUSED", "DISABLED", "ERROR"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "DRAFT" | "ACTIVE" | "PAUSED" | "DISABLED" | "ERROR" | undefined;
    description?: string | undefined;
    mode?: BotMode | undefined;
    sourceType?: SourceType | undefined;
    payloadSchema?: Record<string, any> | undefined;
    rules?: any;
    actions?: {
        name: string;
        type: ActionType;
        timeoutMs: number;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        retryPolicy?: {
            maxAttempts: number;
            backoffMs: number;
        } | undefined;
    }[] | undefined;
}, {
    name?: string | undefined;
    status?: "DRAFT" | "ACTIVE" | "PAUSED" | "DISABLED" | "ERROR" | undefined;
    description?: string | undefined;
    mode?: BotMode | undefined;
    sourceType?: SourceType | undefined;
    payloadSchema?: Record<string, any> | undefined;
    rules?: any;
    actions?: {
        name: string;
        type: ActionType;
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
        url?: string | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        telegramChatId?: string | undefined;
        telegramMessageTemplate?: string | undefined;
        emailTo?: string | undefined;
        emailSubject?: string | undefined;
        emailBodyTemplate?: string | undefined;
        timeoutMs?: number | undefined;
        retryPolicy?: {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
        } | undefined;
    }[] | undefined;
}>;
export declare const CreateApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    expiresInDays: z.ZodOptional<z.ZodNumber>;
    scopes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    scopes: string[];
    expiresInDays?: number | undefined;
}, {
    name: string;
    expiresInDays?: number | undefined;
    scopes?: string[] | undefined;
}>;
export declare const TestEventSchema: z.ZodObject<{
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    payload: Record<string, any>;
    headers?: Record<string, string> | undefined;
}, {
    payload: Record<string, any>;
    headers?: Record<string, string> | undefined;
}>;
//# sourceMappingURL=index.d.ts.map