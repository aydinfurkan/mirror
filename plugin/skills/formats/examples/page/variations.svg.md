# Example: `ui/main/variations.svg` of a `frontend` page

The components of the main view of "Edit user": the `TextField` of the email and the `Button`
"Save".

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 220" font-family="ui-sans-serif, system-ui, sans-serif">
<title>Edit user: variations</title>
<rect width="1040" height="220" fill="#ffffff"/>
<g data-variation="TextField email: default"><text x="20" y="30" font-size="14" font-weight="600" fill="#09090b">Email</text><rect x="20" y="42" width="300" height="44" rx="8" fill="#ffffff" stroke="#d4d4d8"/><text x="36" y="70" font-size="15" fill="#09090b">ada@example.com</text></g>
<g data-variation="TextField email: focus"><text x="360" y="30" font-size="14" font-weight="600" fill="#09090b">Email</text><rect x="360" y="42" width="300" height="44" rx="8" fill="#ffffff" stroke="#2563eb"/><text x="376" y="70" font-size="15" fill="#09090b">ada@example.com</text></g>
<g data-variation="TextField email: error"><text x="700" y="30" font-size="14" font-weight="600" fill="#09090b">Email</text><rect x="700" y="42" width="300" height="44" rx="8" fill="#ffffff" stroke="#dc2626"/><text x="716" y="70" font-size="15" fill="#09090b">ada@</text><text x="700" y="106" font-size="13" fill="#dc2626">Enter a valid email address.</text></g>
<g data-variation="Button &quot;Save&quot;: default"><rect x="20" y="150" width="124" height="44" rx="8" fill="#2563eb"/><text x="82" y="177" font-size="15" font-weight="600" fill="#ffffff" text-anchor="middle">Save</text></g>
<g data-variation="Button &quot;Save&quot;: disabled"><rect x="184" y="150" width="124" height="44" rx="8" fill="#e4e4e7"/><text x="246" y="177" font-size="15" font-weight="600" fill="#a1a1aa" text-anchor="middle">Save</text></g>
<g data-variation="Button &quot;Save&quot;: saving"><rect x="348" y="150" width="124" height="44" rx="8" fill="#93b4f5"/><circle cx="382" cy="172" r="7" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="30 14"/><text x="420" y="177" font-size="15" font-weight="600" fill="#ffffff" text-anchor="middle">Saving…</text></g>
</svg>
```
