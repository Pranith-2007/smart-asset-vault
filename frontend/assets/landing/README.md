# Landing page screenshots

All screenshot definitions live in `frontend/src/data/landingScreenshots.ts`.

## Replace a screenshot
1. Save your phone screenshot over the matching file here (`hero-phone.png`, `document-vault.png`, `blockchain-verification.png`, `secure-sharing.png`, `role-access.png`). Portrait 1:2 (e.g. 1080×2160) works best; the frame crops to that ratio.
2. In `landingScreenshots.ts`, set `placeholder: false` on that entry (this removes the "Placeholder" badge and "Placeholder image:" alt prefix). Update `alt` to describe the real screen.

## Add another feature row
1. Add the PNG to this folder.
2. Append an object to `featureScreenshots` with `id`, `order` (rows sort by it), `title`, `description`, `image: require('../../assets/landing/your-file.png')`, `alt`, `position` (`'left'` or `'right'` = side the screenshot sits on desktop) and `placeholder`.
Metro needs a literal `require()` path, so the image can't be built dynamically.
On narrow screens every row stacks: screenshot above text.
