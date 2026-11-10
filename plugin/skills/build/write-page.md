# Write the page

The input is the JSON data and a target path.

1. If `.mirror/visualize.html` exists, save its text between `/* MIRROR:TOKENS:START */` and
   `/* MIRROR:TOKENS:END */`. This block has the colors and fonts of the user.
2. Write the template to the target path. The template is the HTML in the ```` ```html ````
   block of `visualize-template.md` of this skill. Copy it with a shell command, not by hand:
   `sed -e '1,/^```html$/d' -e '/^```$/,$d' <skill base directory>/visualize-template.md > <target path>`.
   Do not use an old page as the template.
3. If you saved a block in step 1, put it in the same block of the new page.
4. Replace the content of `<script type="application/json" id="mirror-data">` with the JSON.
5. Make sure that the data block is valid JSON.
6. Do not open the page. In your response, give the user a link to the page, so that the user
   can click it to open the page.
