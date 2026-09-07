# System Architecture

## Overview

The application uses a React frontend served by an Express-based Node runtime. Typed tRPC procedures provide the boundary between browser interactions and server-side operations. Native AI calls are kept server-side so provider credentials are not exposed in browser code.

## Components

| Component | Responsibility |
|---|---|
| React client | Renders routes, forms, chat, upload preview, report confirmation, and responsive visual states. |
| Wouter router | Provides client-side navigation for dashboard, assistant, classifier, report, guide, and about pages. |
| tRPC client | Sends typed requests from the browser to the application server. |
| Express runtime | Serves the application and hosts the tRPC API boundary. |
| Native AI service | Handles waste-management chat and image classification on the server side. |
| Report service procedure | Validates and prepares structured report payloads with status and report ID. |
| Drizzle layer | Provides the prepared database schema and persistence foundation. |

## Primary Data Flows

The assistant sends a user question and session identifier to the application server. The server applies a waste-management system prompt and calls the native AI service, then returns the response to the browser.

The classifier converts the selected image to a data URL in the browser and passes it through the `analyzeWasteImage` abstraction to the typed server procedure. The server sends the image to the native vision model and returns structured category, disposal method, recycling recommendation, and confidence fields.

The report form validates user input and produces a structured payload containing the report ID, category or waste type, description, location, optional image metadata, optional contact information, status, and timestamp. The confirmation screen displays the generated report ID and Pending Review status.

## Security Considerations

AI calls and credentials remain server-side. Browser code contains no provider secret. Image size and type validation occur before classifier submission. User-facing copy avoids claiming unsupported local rules or successful authority delivery.
