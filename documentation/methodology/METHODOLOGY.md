# Methodology

## Development Approach

The project was developed as a modular web application. The interface was established first, followed by typed server procedures, native AI integration, feature-level validation, and visual verification. Runtime-critical framework paths were preserved during the documentation organization pass.

## Requirement Decomposition

Requirements were divided into shared navigation, dashboard presentation, conversational assistance, image classification, civic reporting, guide content, and deployment concerns. Each area was implemented as a dedicated page or reusable component. The report modal and image-analysis service boundary isolate feature-specific state from the rest of the interface.

## AI Integration Method

The assistant uses a server-side prompt specialized for waste management. The classifier uses a server-side vision request with a strict JSON schema so the UI receives predictable category, disposal, recycling, and confidence fields. The browser interacts with typed procedures rather than exposing provider credentials.

## Validation Method

Validation combines TypeScript checking, automated unit and integration tests, production compilation, browser screenshots, and interactive form testing. Tests cover native assistant behavior, native vision request structure, local report payload preparation, authentication logout behavior, and error handling. Visual checks cover homepage, classifier, report page, and report confirmation behavior.

## Limitations of the Method

The project-level tests mock the native AI provider when verifying request shape and response handling. They therefore confirm application integration logic but do not represent a guarantee about every external model response. Location behavior depends on browser permission and device support.
