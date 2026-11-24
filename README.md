# 🐱 Cat Gallery

A small web page that shows real cat photos pulled live from the internet.

- Photos come from [The Cat API](https://thecatapi.com), with [Cataas](https://cataas.com) as a fallback. Both serve real photographs of cats.
- Infinite scroll, plus a **Load more cats** button
- **Shuffle** to get a new set
- Click a photo to enlarge it, and use ← / → to browse and Esc to close
- Tap ♡ to save favorites. They're kept in your browser's local storage.

## Run it

You don't need a build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

It also works as-is on GitHub Pages.

## Offline version

The `gallery/` folder holds 456 real cat photos (checked by hand) and a page that shows 40 random ones at a time. Shuffle swaps in a new 40. It also has Yarn, a little chat in the corner that answers three cat questions. It works without internet: open `gallery/index.html`.
