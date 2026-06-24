# Swift7 Social PNG Exporter

Open `export.html` in a local server to preview and export Swift7 social templates.

## Use

1. Start a local server from the repo root:

   ```sh
   php -S 127.0.0.1:8088
   ```

2. Open:

   ```text
   http://127.0.0.1:8088/Swift7%20Design%20System/social/export.html
   ```

3. Pick a template and click **Download PNG**.

Click text directly inside the preview to edit it before exporting. Click any image in
the preview to replace it with an uploaded image. Use **Reset edits** to reload the
original template copy and images.

Select text or an image to reveal resize controls in the sidebar. Text can be resized
with the font-size slider. Images can be replaced, zoomed and repositioned.

The exporter downloads at the template's native size, such as `1080x1080`, `1080x1920`, `1200x627`, or `1500x500`.

## Files

- `social-posts.html` is the design-board view.
- `export.html` is the practical PNG exporter.
- `SocialPosts.jsx` holds the actual Swift7 post templates.
- `SocialExporter.jsx` holds the picker, preview and download behaviour.
