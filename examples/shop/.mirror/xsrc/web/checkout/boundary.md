## Input

Route `/checkout`, form fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | text | yes | Checked by the API. |

Example:

```json
{ "email": "ada@example.com" }
```

## Output

| Result | Shows | When |
| --- | --- | --- |
| Go to Stripe Checkout | The Stripe payment page. | The API creates the order. |
| Alert on the form | The API error message. | The API returns 400 or 409. |
| Alert | "Payment is not available." | The API returns 502. |
