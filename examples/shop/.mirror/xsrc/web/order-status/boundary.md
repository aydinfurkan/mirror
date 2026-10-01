## Input

Route `/orders/:id`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | route param | yes | Checked by the API. |

## Output

| Result | Shows | When |
| --- | --- | --- |
| Paid | "Paid", the items and the total. | The status is `paid`. |
| Pending | "Waiting for the payment…" | The status is `pending`. |
| Cancelled | "Cancelled", the items and the total. | The status is `cancelled`. |
| Alert | "Order not found." | The API returns 404. |
