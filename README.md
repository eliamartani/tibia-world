# Tibia World Tracker

A responsive single-page application for exploring Tibia worlds with fast client-side filtering, sorting, and cached data loading.

> [!NOTE]
> The app fetches world data from the public [TibiaData API](https://docs.tibiadata.com/), caches the result locally, and only refreshes from the network when the user explicitly clicks `Reload`.

## Project Overview

Tibia World Tracker helps players and developers quickly inspect the current state of Tibia game worlds without repeatedly querying the API.

Core value:

- Browse all available Tibia worlds in a responsive card grid.
- Filter by PvP mode, region, and worlds protected since release.
- Sort by world name or current online player count.
- Reuse cached data between refreshes for a faster, lower-noise experience.
- Validate behavior with automated tests and a production build step.

## Feature Highlights

- Vue 3 + TypeScript + Vite application shell
- Tailwind CSS v4 styling
- TibiaData `/v4/worlds` integration
- Local cache backed by `localStorage`
- Responsive sidebar and card layout
- Vitest coverage for filter and data-loading behavior

## Prerequisites

Before you start, make sure your machine has the following installed:

- `Node.js` 20.x or newer
- `npm` 10.x or newer
- A modern browser such as Chrome, Edge, Firefox, or Safari

Recommended development environment:

- macOS, Linux, or Windows with a POSIX-compatible shell
- VS Code or another editor with Vue and TypeScript support

To verify your toolchain:

```bash
node --version
npm --version
```

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/eliamartani/tibia-world.git
cd tibia-world
npm install
```

Start the development server:

```bash
npm run dev
```

By default, Vite prints a local URL similar to:

```text
http://localhost:5173/
```

Create a production build:

```bash
npm run build
```

Run the automated tests:

```bash
npm test
```

Preview the built application locally:

```bash
npm run preview
```

## Setup Guide

Follow this sequence for a first-time local setup:

1. Install Node.js and npm.
2. Clone the repository.
3. Run `npm install`.
4. Start the app with `npm run dev`.
5. Open the local Vite URL in your browser.
6. Confirm the initial world list loads.
7. Apply filters and sorting from the sidebar.
8. Click `Reload` to fetch a fresh dataset from TibiaData.

> [!TIP]
> The first load uses the network. Later page visits reuse cached data until `Reload` is pressed.

## Configuration

This project does not currently require any environment variables.

### The app loads but world data does not appear

Check:

- Your internet connection
- Whether `https://api.tibiadata.com/v4/worlds` is reachable
- Browser console output for network failures

Helpful recovery steps:

- Refresh the page
- Click `Reload`
- Clear browser storage for the site if stale cache behavior is suspected

## Contributing

Contributions are welcome.

Recommended workflow:

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run tests and build locally.
5. Open a pull request with a clear summary.

Suggested pre-PR checklist:

- Keep changes scoped to one concern
- Update tests when behavior changes
- Verify `npm test`
- Verify `npm run build`
- Update documentation when setup or usage changes

## License

This project is licensed under the MIT License.

See the [LICENSE](./LICENSE) file for details.

## Contact

Maintainer and project repository:

- [eliamartani/tibia-world](https://github.com/eliamartani/tibia-world)
