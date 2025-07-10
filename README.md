[![GitHub License](https://img.shields.io/github/license/TejBirringTM/uk-explr?color=blue)](LICENSE.md)
[![Last Commit](https://img.shields.io/github/last-commit/TejBirringTM/uk-explr)](https://github.com/TejBirringTM/uk-explr/commits/main/)
[![GitHub Issues](https://img.shields.io/github/issues/TejBirringTM/uk-explr)](https://github.com/TejBirringTM/uk-explr/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/TejBirringTM/uk-explr)](https://github.com/TejBirringTM/uk-explr/pulls)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-007ACC?logo=typescript&logoColor=007ACC&labelColor=FFF)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-23+-3C873A?logo=node.js&labelColor=FFF)](https://nodejs.org)

# UK Explr

## Overview

UK Explr (alt. `uk-explr`) is a scalable ETL pipeline for UK census data that transforms bulk "raw" data (CSV and JSON files) into a unified statistical lookup table with multi-resolution querying capabilities.

### Key Features

#### Flexible Geospatial Querying

Look up statistics by:

✅ Output Area (OA)
✅ Lower/Middle Layer Super Output Areas (LSOA/MSOA)
✅ Local Authority Districts (LAD)
✅ Postal Codes

#### Integrated Services

🚀 Production-ready REST API for web applications

⚡ MCP (Model Context Protocol) server for system integration — [TO DO](#to-do)

#### Optimised Data Processing

- Efficient handling of large datasets (e.g. UK census data)

- Normalised output structure for consistent analysis

### Use Cases

- Real estate investment

- Policy analysis & demographic research

- Location-based service development

- Academic studies requiring unified datasets

Built with reliability and scalability in mind, this pipeline serves as a robust foundation for applications requiring granular UK geospatial statistics.

## Structure

```text
data/
├─ raw/             # Source data files before processing (CSV, JSON, etc.)
etl-pipeline/       # Scripts for schema generation and data transformation
libs/               # Shared utilities and helper functions (project-wide)
web-api/            # REST API server implementation
├─ controllers/     # Business logic for handling requests/responses
├─ libs/            # API-specific utilities and helpers
├─ middleware/      # Express/HTTP middleware functions
├─ models/          # Data validation schemas (request/response shapes)
├─ services/        # Business logic and external service integrations
├─ types/           # TypeScript interfaces and type definitions
├─ index.ts         # web server entry point
node_modules/       # Installed npm dependencies
```

## TO DO

Major features in the current roadmap:

```text
Key:
🔴 — scheduled: very important
🟠 — scheduled: important
🟡 — scheduled
🔘 — backlogged
```

- [ ] Add `USAGE.md` to explain how to use the codebase. 🔴

- [ ] Implement MCP (Model Context Protocol) Server for AI integration. 🔴

- [ ] Implement HATEOAS (Hypermedia as the Engine of Application State) best practises in RESTful API implementation. 🟠

- [ ] Ingest street names to associate with postal codes. 🟡

- [ ] Ingest point geocoordinates for streets. 🔘

- [ ] Ingest boundary geocoordinates for Output Area (OA), Lower-layer Super Output Area (LSOA), Middle-layer Super Output Area (MSOA), and Local Area District (LAD). 🔘

## Contribution

**Contributions are welcome!**

Feel free to discuss improvements by [opening an issue](https://github.com/TejBirringTM/uk-explr/issues).

Alternatively, feel free to make improvements by [submitting a pull request (PR)](https://github.com/TejBirringTM/uk-explr/pulls).

## License

MIT; please see [LICENSE file](LICENSE.md) for more information.
