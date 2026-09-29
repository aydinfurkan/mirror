## Input

Route `/cart`, form fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `quantity` | number per item | yes | 0–10 |

## Output

| Result | Shows | When |
| --- | --- | --- |
| Cart | Each item, its quantity, and the total. | The cart has items. |
| Empty state | "Your cart is empty." | The cart has no items. |
| Go to `/checkout` | The checkout page. | The customer clicks "Checkout". |
