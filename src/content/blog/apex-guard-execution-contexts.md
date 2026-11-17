---
title: 'Runtime Detection, Quiddity & Custom Exceptions'
slug: 'apex-guard-execution-contexts'
date: '2026-11-16'
summary: 'Deep dive into System.Quiddity runtime resolution, AuraHandledException.setMessage(), Screen vs. Record-Triggered Flows, SObject.isSet() safety, custom Exception overloads, and Nebula Logger hooks.'
tags: ['Salesforce', 'Apex', 'Quiddity', 'LWC', 'Flows']
repoUrl: 'https://github.com/masaner/apex-guard'
series: 'ApexGuard'
category: 'ApexGuard'
sidebarTitle: 'Runtime & Error Codes'
order: 4
showInIndex: false
---

Salesforce Apex runs across many heterogeneous runtimes within the same org: synchronous Apex services, Triggers, `@AuraEnabled` LWC controllers, Flows, Agentforce Invocable Actions, `@RestResource` endpoints, and Asynchronous jobs (`Queueable`, `Batchable`, `@future`, `Schedulable`). A single unhandled exception type cannot serve all of them cleanly.

`ApexGuard` centralizes runtime detection and failure dispatch inside [`GuardContext.cls`](https://github.com/masaner/apex-guard/blob/main/force-app/main/default/classes/context/GuardContext.cls).

---

## Runtime Resolution

At failure time, `GuardContext` inspects two platform signals without executing SOQL or DML:

1. **`Trigger.isExecuting`** (checked via `GuardContext.isTriggerContext()`)
2. **`System.Request.getCurrent().getQuiddity()`** (checked via `GuardContext.getCurrentQuiddity()`)

| Runtime                                                       | Detected Signal                                  | Default `Guard` Failure Behavior                                                              | Recommended Pattern                                                     |
| :------------------------------------------------------------ | :----------------------------------------------- | :-------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Apex Services / Utilities**                                 | `SYNCHRONOUS`, `ANONYMOUS`                       | Throws `GuardException`                                                                       | `Guard.isNotNull(...)`, `Guard.isValidId(...)`                          |
| **Triggers**                                                  | `Trigger.isExecuting == true` (`TRIGGER`)        | Throws `GuardException` for structural failures; attaches `addError()` via `Guard.onRecord()` | `Guard.isNotEmpty(Trigger.new, 'Trigger.new')` + `Guard.onRecord(rec)`  |
| **LWC / Aura Controllers**                                    | `Quiddity.AURA` or `Guard.forLwc()`              | Throws `AuraHandledException` with `setMessage()` called                                      | `Guard.forLwc().isNotBlank(...)` or automatic `Quiddity.AURA` detection |
| **Screen Flows / Autolaunched Flows / Agentforce**            | `Quiddity.INVOCABLE_ACTION`                      | `GuardException` (triggers Fault path) or structured `Result` when `throwOnFailure = false`   | `GuardFlowAction` (`@InvocableMethod`)                                  |
| **Record-Triggered Flows**                                    | `Quiddity.SYNCHRONOUS` / `Trigger.isExecuting`   | Throws `GuardException` (Fault path) or `Result` via `GuardFlowAction`                        | `GuardFlowAction` (`throwOnFailure = false` for validation branching)   |
| **REST APIs / Webhooks**                                      | `Quiddity.REST`                                  | Throws `GuardException`                                                                       | Catch `GuardException`, serialize `ex.toMap()` as HTTP 400 JSON         |
| **Async Apex (`Queueable`, `Batch`, `@future`, `Scheduled`)** | `QUEUEABLE`, `BATCH_APEX`, `FUTURE`, `SCHEDULED` | Throws `GuardException`                                                                       | Log `ex.toMap()` in `TransactionFinalizer` / catch blocks               |

---

## Platform Edge Cases

### 1. The `AuraHandledException.setMessage()` Trap

In Apex, calling `throw new AuraHandledException('Invalid input');` **does not** populate `ex.getMessage()` properly in all contexts—Apex tests and LWC error handlers frequently receive `"Script-thrown exception"` unless `auraEx.setMessage(message)` is explicitly invoked on the instance before throwing.

`GuardContext.createAuraHandledException(String message)` always executes both:

```apex
AuraHandledException auraEx = new AuraHandledException(safeMessage);
auraEx.setMessage(safeMessage);
return auraEx;
```

### 2. Record-Triggered Flows vs. Screen Flows (`Quiddity`)

- **Screen Flows, Autolaunched Flows, and Agentforce Actions** run under `System.Quiddity.INVOCABLE_ACTION`.
- **Record-Triggered Flows** that invoke Apex `@InvocableMethod` actions often run under `System.Quiddity.SYNCHRONOUS` (or alongside DML/trigger execution).

`GuardFlowAction` relies on `GuardContext.getExecutionContextName()`, which prioritizes `'TRIGGER'` whenever `Trigger.isExecuting` is `true` and otherwise records the active `System.Quiddity` name. Regardless of which Flow type calls `GuardFlowAction`, setting `throwOnFailure = false` safely captures `GuardException` and populates `Result.isValid = false`, `Result.errorMessage`, `Result.errorCode`, and `Result.executionContext`.

### 3. Apex Collection Covariance vs. Invariance (`Set<Id>`, `Set<String>`, `Map`)

In Apex:

- `List<T>` is **covariant**: `List<Account>` and `List<String>` implicitly convert to `List<Object>`.
- `Set<T>` is **invariant**: `Set<Id>` and `Set<String>` do **not** convert to `Set<Object>`.
- `Map<K, V>` is **invariant in its key type** (`Map<Id, Account>` does not convert to `Map<Object, Object>`) while `SObject` subtypes convert to `Object`/`SObject` values (`Map<String, Account>` resolves cleanly to `Map<String, Object>` without needing a separate `Map<String, SObject>` overload, which would otherwise collide ambiguously).

To provide seamless ergonomics without forcing callers to copy sets/maps, [`GuardCollectionValidator.cls`](https://github.com/masaner/apex-guard/blob/main/force-app/main/default/classes/validators/GuardCollectionValidator.cls) and [`Guard.cls`](https://github.com/masaner/apex-guard/blob/main/force-app/main/default/classes/core/Guard.cls) provide explicit overloads for `Set<Id>`, `Set<String>`, `Set<Integer>`, `Map<Id, SObject>`, `Map<String, Object>`, and `Map<String, String>`.

### 4. `SObject.isSet(Schema.SObjectField)` on Sparse SOQL Records

Reading an unqueried field from an `SObject` via `record.get(field)` throws `System.SObjectException: SObject row was retrieved via SOQL without querying the requested field`. Both `Guard.hasPopulatedField(...)` and `Guard.onRecord(record)` check `record.isSet(field)` before calling `record.get(field)`.

---

## Testing Execution Contexts

`GuardContext` exposes `@TestVisible` overrides so `@IsTest` suites can deterministically verify any runtime without deploying Triggers or calling Lightning endpoints:

```apex
GuardContext.testQuiddityOverride = System.Quiddity.AURA;
// ... assert AuraHandledException ...
Guard.resetContext(); // Always clean up in a finally block
```

---

## Custom Messages & `Exception` Overloads

While `ApexGuard` provides descriptive messages and standardized error codes out of the box, enterprise applications frequently need custom domain messages, custom `Exception` classes, or structured JSON payloads for API consumers.

### 1. Custom Message Overloads

Every parameter-named guard on `Guard` accepts an optional `customMessage` argument:

```apex
Guard.isGreaterThan(
    discountPercent,
    0,
    'discountPercent',
    'Discount percentage must be positive before submitting approval.'
);
```

Even when `customMessage` is supplied, `GuardException` still retains `getParamName()` (`'discountPercent'`), `getErrorCode()` (`GuardException.ERR_GREATER_THAN`), and `getExecutionContext()`.

### 2. Custom `Exception` Overloads

Every core `Guard` check supports passing an explicit `Exception` instance. If the check fails, `ApexGuard` routes the failure through any active `IGuardFailureHandler` and then throws your exact exception instance:

```apex
public class InsufficientCreditException extends Exception {
}

public void authorizeCharge(Decimal availableCredit) {
    Guard.isGreaterThan(
        availableCredit,
        0,
        new InsufficientCreditException('Customer credit balance is exhausted.')
    );
}
```

---

## Error Metadata & 30 Codes

When standard `GuardException` is thrown, callers and global error handlers can inspect structured fields without fragile string parsing:

```apex
try {
    Guard.isIdOfType(recordId, Opportunity.SObjectType, 'opportunityId');
} catch (GuardException ex) {
    String param = ex.getParamName();          // 'opportunityId'
    String code = ex.getErrorCode();           // 'GUARD_ID_SOBJECT_TYPE'
    Object actual = ex.getActualValue();       // offending Id
    System.Quiddity q = ex.getQuiddity();      // e.g., Quiddity.REST
    String ctx = ex.getExecutionContext();     // e.g., 'REST' or 'TRIGGER'
    Map<String, Object> payload = ex.toMap();  // Ready for JSON.serialize(payload)
}
```

### Standardized Error Code Constants (`GuardException`)

| Constant                                    | Value                            |
| :------------------------------------------ | :------------------------------- |
| `GuardException.ERR_NULL_VALUE`             | `'GUARD_NULL_VALUE'`             |
| `GuardException.ERR_NOT_NULL_VALUE`         | `'GUARD_NOT_NULL_VALUE'`         |
| `GuardException.ERR_TRUE_EXPECTED`          | `'GUARD_TRUE_EXPECTED'`          |
| `GuardException.ERR_FALSE_EXPECTED`         | `'GUARD_FALSE_EXPECTED'`         |
| `GuardException.ERR_EMPTY_STRING`           | `'GUARD_EMPTY_STRING'`           |
| `GuardException.ERR_BLANK_STRING`           | `'GUARD_BLANK_STRING'`           |
| `GuardException.ERR_STRING_LENGTH`          | `'GUARD_STRING_LENGTH'`          |
| `GuardException.ERR_MAX_LENGTH`             | `'GUARD_MAX_LENGTH'`             |
| `GuardException.ERR_REGEX_MISMATCH`         | `'GUARD_REGEX_MISMATCH'`         |
| `GuardException.ERR_GREATER_THAN`           | `'GUARD_GREATER_THAN'`           |
| `GuardException.ERR_GREATER_OR_EQUAL`       | `'GUARD_GREATER_OR_EQUAL'`       |
| `GuardException.ERR_LESS_THAN`              | `'GUARD_LESS_THAN'`              |
| `GuardException.ERR_LESS_OR_EQUAL`          | `'GUARD_LESS_OR_EQUAL'`          |
| `GuardException.ERR_OUT_OF_RANGE`           | `'GUARD_OUT_OF_RANGE'`           |
| `GuardException.ERR_ZERO_VALUE`             | `'GUARD_ZERO_VALUE'`             |
| `GuardException.ERR_EMPTY_COLLECTION`       | `'GUARD_EMPTY_COLLECTION'`       |
| `GuardException.ERR_COLLECTION_SIZE`        | `'GUARD_COLLECTION_SIZE'`        |
| `GuardException.ERR_MISSING_KEY`            | `'GUARD_MISSING_KEY'`            |
| `GuardException.ERR_INVALID_ID`             | `'GUARD_INVALID_ID'`             |
| `GuardException.ERR_ID_SOBJECT_TYPE`        | `'GUARD_ID_SOBJECT_TYPE'`        |
| `GuardException.ERR_SOBJECT_TYPE`           | `'GUARD_SOBJECT_TYPE'`           |
| `GuardException.ERR_UNPOPULATED_FIELD`      | `'GUARD_UNPOPULATED_FIELD'`      |
| `GuardException.ERR_SOBJECT_NOT_ACCESSIBLE` | `'GUARD_SOBJECT_NOT_ACCESSIBLE'` |
| `GuardException.ERR_SOBJECT_NOT_CREATEABLE` | `'GUARD_SOBJECT_NOT_CREATEABLE'` |
| `GuardException.ERR_SOBJECT_NOT_UPDATEABLE` | `'GUARD_SOBJECT_NOT_UPDATEABLE'` |
| `GuardException.ERR_SOBJECT_NOT_DELETABLE`  | `'GUARD_SOBJECT_NOT_DELETABLE'`  |
| `GuardException.ERR_FIELD_NOT_ACCESSIBLE`   | `'GUARD_FIELD_NOT_ACCESSIBLE'`   |
| `GuardException.ERR_FIELD_NOT_CREATEABLE`   | `'GUARD_FIELD_NOT_CREATEABLE'`   |
| `GuardException.ERR_FIELD_NOT_UPDATEABLE`   | `'GUARD_FIELD_NOT_UPDATEABLE'`   |
| `GuardException.ERR_INVALID_GUARD_ARGUMENT` | `'GUARD_INVALID_ARGUMENT'`       |

---

## Global Hooks & Translation

Contributors and enterprise teams can hook into every guard failure in a transaction by implementing [`IGuardFailureHandler.cls`](https://github.com/masaner/apex-guard/blob/main/force-app/main/default/classes/context/IGuardFailureHandler.cls) and registering it via `Guard.setFailureHandler(...)`:

### Telemetry & Nebula Logger Adapter

```apex
public class TelemetryFailureHandler implements IGuardFailureHandler {
    public void handleFailure(GuardContext.Failure failure) {
        // Option A: Log structured metadata and allow ApexGuard to throw normally
        System.debug(
            LoggingLevel.ERROR,
            JSON.serialize(failure.toGuardException().toMap())
        );
    }
}

// Register at the start of an entry point:
Guard.setFailureHandler(new TelemetryFailureHandler());
```

### Global Domain Exception Translation

If your codebase standardizes on a single domain exception (e.g., `ApplicationException`) across all services, translate every `GuardContext.Failure` cleanly while preserving explicit caller exception overrides:

```apex
public class ApplicationExceptionAdapter implements IGuardFailureHandler {
    public void handleFailure(GuardContext.Failure failure) {
        if (failure.customException != null) {
            return; // Respect explicit caller exception overrides
        }
        throw new ApplicationException(failure.errorCode + ': ' + failure.message);
    }
}
```
