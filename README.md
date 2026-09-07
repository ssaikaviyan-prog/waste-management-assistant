# Waste Management Assistant

## Project Objective

Waste Management Assistant is a responsive environmental-technology web application that helps users understand waste segregation, recycling, composting, hazardous waste, e-waste, waste reduction, collection guidance, and community waste reporting. The interface is designed as the frontend and demonstration surface for a native AI-assisted waste-management system.

## Problem Statement

Households, students, and communities often lack clear, actionable information about how to classify, prepare, recycle, compost, or safely dispose of waste. Uncollected and illegally dumped waste can also remain invisible to collection teams. This project combines guidance, image classification, and structured civic reporting in one accessible interface.

## Features

The application includes a dashboard, native AI waste-management assistant, waste image classification, a Report Waste Issue flow with category selection, location support, photo preview, structured payloads, generated report IDs, and Pending Review confirmation, a searchable waste guide, and an architecture/about section.

## Technologies Used

The project uses React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, Wouter routing, tRPC, Express, Vitest, and the Manus server-side LLM integration. The database layer is prepared with Drizzle ORM and MySQL-compatible schema definitions.

## System Architecture Overview

The runtime remains in the original framework paths to preserve imports and deployment behavior. `client/` contains the frontend, `server/` contains the Express and tRPC backend, `shared/` contains shared types and constants, and `drizzle/` contains database schema and migrations. The assistant and image classifier use server-side native AI. Report submissions are validated and prepared locally for review.

## Installation and Run Commands

Install dependencies with `pnpm install`. Start development with `pnpm dev`. Run the type checker with `pnpm check`. Run automated tests with `pnpm test`. Build production assets with `pnpm build`, then start the production server with `pnpm start`.

## Testing

The verified validation command is `pnpm check && pnpm test && pnpm build`. The final validation completed with six passing tests, no TypeScript errors, a successful production build, responsive visual checks, and interactive report-form verification. See [`tests/test_report/TEST_REPORT.md`](tests/test_report/TEST_REPORT.md).

## Deployment

The deployed website is available at <https://wastemanage-edf9jmvs.manus.space>. Deployment notes are stored in [`deployment/deployment_links.txt`](deployment/deployment_links.txt).

## GitHub Information

The project has a configured `origin` remote in the current environment. Repository-specific release notes are stored under [`github/repository_notes/`](github/repository_notes/). The project is ready for a final commit and repository review.

## Future Improvements

Future work may add persistent report storage, report history and status tracking, location-aware disposal guidance, richer image-analysis history, administrator review tools, and a direct configurable vision provider behind the existing `analyzeWasteImage` service boundary.

## Organization Note

The requested academic folder structure has been added without moving runtime-critical files. Source files remain in their working paths so imports, builds, and managed deployment continue to function.
