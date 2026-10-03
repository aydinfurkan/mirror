# Write the page

The input is the JSON data and a target path.

1. If `.mirror/visualize.html` exists, save its text between `/* MIRROR:TOKENS:START */` and
   `/* MIRROR:TOKENS:END */`. This block has the colors and fonts of the user.
2. Copy `visualize.html` of this skill to the target path. Do not use an old page as the
   template.
3. If you saved a block in step 1, put it in the same block of the new page.
4. Replace the content of `<script type="application/json" id="mirror-data">` with the JSON.
5. Make sure that the data block is valid JSON.
6. Open the page in VS Code with `code -r <target path>`. If `code` is not found, tell the user
   to open the file.
