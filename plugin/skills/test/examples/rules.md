# The rules of `api/cancel-order`

The list from step 1, for the flow `api/cancel-order` of the shop example.

| Id | Source | Rule |
| --- | --- | --- |
| `api/cancel-order AC1` | Acceptance criteria | A paid order of the last 24 hours is cancelled. |
| `api/cancel-order AC2` | Acceptance criteria | An order that is not paid, is already cancelled, or is older than 24 hours cannot be cancelled. |
| `api/cancel-order AC3` | Acceptance criteria | When the refund fails, the order stays paid and the customer sees an error. |
| `api/cancel-order AC4` | Acceptance criteria | The items of a cancelled order go back in the stock one time. |
| `api/cancel-order C1` | Constraints | A customer can cancel only a paid order, and only in the 24 hours after the order. |
| `api/cancel-order C2` | Constraints | Give the money back before the order is cancelled. |
| `api/cancel-order C3` | Constraints | Put the items back in the stock only after the order is cancelled. |
| `api/cancel-order O1` | Output | 200: the order is cancelled and the refund exists. |
| `api/cancel-order O2` | Output | 404: the order does not exist. |
| `api/cancel-order O3` | Output | 409: the order is not `paid`, or it is older than 24 hours. |
| `api/cancel-order O4` | Output | 502: Stripe does not answer. |

Test data from the `Example` blocks of `boundary.md`:

- `Example (200)`: `{ "id": "o1", "status": "cancelled" }`
- `Example (409)`: `{ "error": { "code": "conflict", "message": "Only a paid order of the last 24 hours can be cancelled." } }`
