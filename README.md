# NEAR Protocol Ecosystem Map

An interactive visualization of the NEAR Protocol ecosystem, showcasing projects, categories, and their development status.

Live at: [nearprotocol.eco](https://nearprotocol.eco)

## Features

- Interactive category-based visualization
- Project filtering and search
- Development status indicators (mainnet, building, inactive)
- Featured categories highlighting
- Share functionality with preview
- Responsive masonry layout
- Project details with social links and token information

## Tech Stack

- [Remix](https://remix.run/) - React framework
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting and KV storage
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [D3.js](https://d3js.org/) - Layout calculations

## Development

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Setup

```bash
# Clone the repository
git clone https://github.com/Tarnadas/near-ecosystem-explorer.git
cd near-ecosystem-explorer

# Install dependencies
yarn install

# Start development server
yarn dev
```

The app will be available at `http://localhost:8788`

### Build

```bash
# Production build
yarn build

# Preview production build
yarn pages:preview
```

## Deployment

The project is deployed on Cloudflare Pages.

## API

The project uses the [NEAR Catalog API](https://docs.nearcatalog.xyz/) for project data:

- Projects list: `https://api.nearcatalog.xyz/projects`
- Project details: `https://api.nearcatalog.xyz/project?pid={projectId}`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
