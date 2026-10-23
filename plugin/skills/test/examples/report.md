# Report: `api` project

The report of step 4, after step 3 wrote the tests in `cancel-order.test.ts`.

| Flow or page | Rules | Covered | Without a test | Failing |
| --- | --- | --- | --- | --- |
| `api/cancel-order` | 11 | 10 | 1 | 1 |
| `api/create-order` | 9 | 9 | 0 | 0 |
| `api/get-order` | 6 | 4 | 2 | 0 |

## Without a test

```text
api/cancel-order C3: Put the items back in the stock only after the order is cancelled.
api/get-order AC2: A customer sees only their own order.
api/get-order O3: 403: the order belongs to another customer.
```

## Failing

```text
api/cancel-order AC4: The items of a cancelled order go back in the stock one time.
  expected 1 "order.cancelled" event, got 2
```

The code does not do what the mirror says. Fix the code or the mirror with the `mirror:change`
skill.

## Stale tags

```text
apps/api/test/orders.test.ts:88  mirror: api/refund-order AC1  (the flow does not exist)
```

## Changed tests

- Fixed the tag `api/create-order AC3` to `AC4` in `apps/api/test/create-order.test.ts:41`.
- Added the tag `api/get-order AC1` in `apps/api/test/get-order.test.ts:12`.
- Wrote `apps/api/test/cancel-order.test.ts`.
