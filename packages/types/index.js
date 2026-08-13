"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicalOperator = exports.RuleOperator = exports.ExecutionStatus = exports.ActionType = exports.SourceType = exports.BotMode = exports.BotStatus = exports.RoleName = void 0;
var RoleName;
(function (RoleName) {
    RoleName["OWNER"] = "OWNER";
    RoleName["ADMIN"] = "ADMIN";
    RoleName["EDITOR"] = "EDITOR";
    RoleName["OPERATOR"] = "OPERATOR";
    RoleName["VIEWER"] = "VIEWER";
})(RoleName || (exports.RoleName = RoleName = {}));
var BotStatus;
(function (BotStatus) {
    BotStatus["DRAFT"] = "DRAFT";
    BotStatus["ACTIVE"] = "ACTIVE";
    BotStatus["PAUSED"] = "PAUSED";
    BotStatus["DISABLED"] = "DISABLED";
    BotStatus["ERROR"] = "ERROR";
})(BotStatus || (exports.BotStatus = BotStatus = {}));
var BotMode;
(function (BotMode) {
    BotMode["LIVE"] = "LIVE";
    BotMode["DRY_RUN"] = "DRY_RUN";
    BotMode["DEMO"] = "DEMO";
})(BotMode || (exports.BotMode = BotMode = {}));
var SourceType;
(function (SourceType) {
    SourceType["WEBHOOK"] = "WEBHOOK";
    SourceType["REST_API"] = "REST_API";
    SourceType["POLLING_API"] = "POLLING_API";
    SourceType["CUSTOM_HTTP"] = "CUSTOM_HTTP";
})(SourceType || (exports.SourceType = SourceType = {}));
var ActionType;
(function (ActionType) {
    ActionType["HTTP_REQUEST"] = "HTTP_REQUEST";
    ActionType["REST_API"] = "REST_API";
    ActionType["WEBHOOK"] = "WEBHOOK";
    ActionType["DATABASE_ACTION"] = "DATABASE_ACTION";
    ActionType["TELEGRAM_NOTIFICATION"] = "TELEGRAM_NOTIFICATION";
    ActionType["EMAIL_NOTIFICATION"] = "EMAIL_NOTIFICATION";
    ActionType["CUSTOM_ACTION"] = "CUSTOM_ACTION";
})(ActionType || (exports.ActionType = ActionType = {}));
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["QUEUED"] = "QUEUED";
    ExecutionStatus["RUNNING"] = "RUNNING";
    ExecutionStatus["SUCCESS"] = "SUCCESS";
    ExecutionStatus["FAILED"] = "FAILED";
    ExecutionStatus["CANCELLED"] = "CANCELLED";
    ExecutionStatus["SKIPPED"] = "SKIPPED";
    ExecutionStatus["DUPLICATE"] = "DUPLICATE";
})(ExecutionStatus || (exports.ExecutionStatus = ExecutionStatus = {}));
var RuleOperator;
(function (RuleOperator) {
    RuleOperator["EQUALS"] = "equals";
    RuleOperator["NOT_EQUALS"] = "not_equals";
    RuleOperator["CONTAINS"] = "contains";
    RuleOperator["NOT_CONTAINS"] = "not_contains";
    RuleOperator["STARTS_WITH"] = "starts_with";
    RuleOperator["ENDS_WITH"] = "ends_with";
    RuleOperator["GREATER_THAN"] = "greater_than";
    RuleOperator["LESS_THAN"] = "less_than";
    RuleOperator["GREATER_OR_EQUAL"] = "greater_or_equal";
    RuleOperator["LESS_OR_EQUAL"] = "less_or_equal";
    RuleOperator["BETWEEN"] = "between";
    RuleOperator["IN"] = "in";
    RuleOperator["NOT_IN"] = "not_in";
    RuleOperator["EXISTS"] = "exists";
    RuleOperator["NOT_EXISTS"] = "not_exists";
    RuleOperator["REGEX"] = "regex";
    RuleOperator["DATE_BEFORE"] = "date_before";
    RuleOperator["DATE_AFTER"] = "date_after";
    RuleOperator["DATE_BETWEEN"] = "date_between";
})(RuleOperator || (exports.RuleOperator = RuleOperator = {}));
var LogicalOperator;
(function (LogicalOperator) {
    LogicalOperator["AND"] = "AND";
    LogicalOperator["OR"] = "OR";
    LogicalOperator["NOT"] = "NOT";
})(LogicalOperator || (exports.LogicalOperator = LogicalOperator = {}));
//# sourceMappingURL=index.js.map