## Input

Route `/products/:id`, form fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | route param | yes | Checked by the API. |
| `quantity` | number | yes | 1–10, at most the stock |

Example:

```json
{ "quantity": 2 }
```

## Output

| Result | Shows | When |
| --- | --- | --- |
| Detail | The product and an "Add to cart" button. | The API returns the product. |
| Toast | "Added to cart." | The customer adds the product. |
| Alert | "Product not found." | The API returns 404. |
