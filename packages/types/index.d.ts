export declare enum RoleName {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    OPERATOR = "OPERATOR",
    VIEWER = "VIEWER"
}
export declare enum BotStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    DISABLED = "DISABLED",
    ERROR = "ERROR"
}
export declare enum BotMode {
    LIVE = "LIVE",
    DRY_RUN = "DRY_RUN",
    DEMO = "DEMO"
}
export declare enum SourceType {
    WEBHOOK = "WEBHOOK",
    REST_API = "REST_API",
    POLLING_API = "POLLING_API",
    CUSTOM_HTTP = "CUSTOM_HTTP"
}
export declare enum ActionType {
    HTTP_REQUEST = "HTTP_REQUEST",
    REST_API = "REST_API",
    WEBHOOK = "WEBHOOK",
    DATABASE_ACTION = "DATABASE_ACTION",
    TELEGRAM_NOTIFICATION = "TELEGRAM_NOTIFICATION",
    EMAIL_NOTIFICATION = "EMAIL_NOTIFICATION",
    CUSTOM_ACTION = "CUSTOM_ACTION"
}
export declare enum ExecutionStatus {
    QUEUED = "QUEUED",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    SKIPPED = "SKIPPED",
    DUPLICATE = "DUPLICATE"
}
export declare enum RuleOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    STARTS_WITH = "starts_with",
    ENDS_WITH = "ends_with",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    GREATER_OR_EQUAL = "greater_or_equal",
    LESS_OR_EQUAL = "less_or_equal",
    BETWEEN = "between",
    IN = "in",
    NOT_IN = "not_in",
    EXISTS = "exists",
    NOT_EXISTS = "not_exists",
    REGEX = "regex",
    DATE_BEFORE = "date_before",
    DATE_AFTER = "date_after",
    DATE_BETWEEN = "date_between"
}
export declare enum LogicalOperator {
    AND = "AND",
    OR = "OR",
    NOT = "NOT"
}
export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    organizationId: string;
    role: RoleName;
}
export interface RuleCondition {
    id?: string;
    field: string;
    operator: RuleOperator;
    value: any;
}
export interface RuleGroup {
    logicalOperator: LogicalOperator;
    conditions: RuleCondition[];
    subGroups?: RuleGroup[];
}
export interface ActionResult {
    success: boolean;
    statusCode?: number;
    durationMs: number;
    data?: any;
    error?: {
        code: string;
        message: string;
        retryable: boolean;
    };
    metadata?: Record<string, any>;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        requestId?: string;
        details?: any;
    };
    meta?: {
        page?: number;
        pageSize?: number;
        totalCount?: number;
        totalPages?: number;
    };
}
//# sourceMappingURL=index.d.ts.map