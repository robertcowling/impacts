# Impact Intelligence Tool — Civil Service Challenge

A real-time geospatial impact intelligence dashboard built for the UK Civil Service Challenge 2026.

**Live demo:** https://robertcowling.github.io/impacts/

## Overview

Monitors and visualises operational impacts across transport, environment, infrastructure, and social services. Features a multimodal LLM pipeline with agentic tasking for automated impact assessment, real-time feed ingestion from multiple sources, and an interactive Leaflet map with boundary-level spatial awareness.

## Features

- Interactive map with geolocated impact markers and local authority boundaries
- Real-time impact feed from multiple source categories
- Agentic impact assessment with LLM-powered summaries
- Timeline scrubber for historical and forecast views
- Constituency and local authority boundary modes
- MCP server integration for AI assistant briefings
- Configurable alerting and search

## Stack

- Vanilla JS / CSS / HTML (no build step)
- Leaflet.js for mapping
- GeoJSON boundary data (ONS)
