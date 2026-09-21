# Shifted Maps – Are there networks in maps?

[Shifted Maps](https://shifted-maps.com) visualizes personal movement data as a network of map extracts showing visited places and their connections.

The geographic map dissolves and creates a flexible network layout, which reveals unique movement structures based on
geographic positions, travel time or travel frequency.

Shifted Maps is a student research project by [Lennart Hildebrandt](https://lennerd.com/) and [Heike Otten](http://www.heikeotten.de/) conducted at the Urban Complexity Lab, University of Applied Sciences Potsdam.

## Installation

1. Select the configured Node.js version with `nvm use`.
2. Install dependencies via `npm ci`.
3. Copy `.env.example` to `.env.local` and add a Mapbox public token if map imagery should be enabled locally.
4. Use `npm start` to start the application.
5. Visit your own Shifted Maps application on [localhost:3000](http://localhost:3000).

The Mapbox token only needs the public `styles:tiles` scope. Restrict the development token to
`http://localhost:3000`. Production uses a separate token restricted to `https://shifted-maps.com`; configure it as
`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in Vercel's Production environment only. Preview deployments intentionally run
without map imagery. The token is public browser configuration and must never receive secret or write scopes. Maps
use `mapbox/streets-v12` by default; `NEXT_PUBLIC_MAPBOX_STYLE_ID` can override that style.

## Feedback

If you have any kind of conceptual or technical feedback or found an issues in the code or when using the app feel free to open an issue here on Github. We’re happy to hear from you!

## License

[GNU GPL v3.0](LICENSE)
