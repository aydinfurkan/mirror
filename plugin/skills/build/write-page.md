# Write the page

1. Copy the template to the target path. The template is `.mirror/visualize.html`. When it does
   not exist, use `visualize.html` of this skill.
2. Replace the text between `/* MIRROR:TOKENS:START */` and `/* MIRROR:TOKENS:END */` with
   the same block of `.mirror/visualize.html`, if it exists. This keeps the colors and fonts of the user.
3. Replace the content of `<script type="application/json" id="mirror-data">` with the JSON.
4. Make sure that the data block is valid JSON.
5. Open the page in VS Code with `code -r <file>`. If `code` is not found, tell the user to
   open the file.
