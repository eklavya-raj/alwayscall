# Overview

Companies conducting business within the European Union are legally required to comply with the General Data Protection Regulation (GDPR).

While many aspects of this regulation may not significantly affect your integration with Stream, the GDPR provisions regarding the right to data access and the right to erasure are directly pertinent.

These provisions relate to data that is stored and managed on Stream's servers.

## The Right to Access Data

GDPR gives EU citizens the right to request access to their information and the right to have access to this information in a portable format. Stream covers this requirement with the user export method.

This method can only be used with server-side authentication.

Check [user export documentation](/video/docs/api/gdpr/users/#users-export/) to see how to use it.

## The Right to Erasure

The GDPR also grants EU citizens the right to request the deletion of their personal information.

Stream offers mechanisms to delete users and calls in accordance with various use cases, ensuring compliance with these regulations.

### Delete calls

Calls can be deleted in two different ways: "soft" or "hard", each with distinct implications.

- Soft-delete: the call details and all related data remain stored on Stream's servers but will no longer be accessible via the API.
- Hard-delete: all data is completely removed from Stream's servers, making it impossible to export.

Check [calls deletion documentation](/video/docs/api/gdpr/calls/) for more information.

### PDPB

The same API endpoints documented here can also be used to comply with India's Personal Data Protection Bill (PDPB) requirements.


---

This page was last updated at 2026-04-17T17:34:03.145Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/gdpr/overview/](https://getstream.io/video/docs/react-native/gdpr/overview/).