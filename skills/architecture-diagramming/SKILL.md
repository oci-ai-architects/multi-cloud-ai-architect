---
name: architecture-diagramming
description: Produces cloud and AI architecture diagrams as code - picks between D2 (with the TALA or default layouts), Mermaid, draw.io (with the public OCI icon toolkit) and ASCII by audience and output, gives D2 syntax, layered OCI and multi-cloud D2 templates, Mermaid flowchart and sequence examples, draw.io CLI export and batch scripts, layering, colour and connector conventions, and a four-step gather, choose, draw, export workflow. Use when drawing or reviewing an architecture diagram for a design doc, ADR, slide or README, choosing a diagram-as-code tool, exporting diagrams in CI, or applying consistent layer and colour conventions across a set of diagrams. Trigger on "diagram", "architecture diagram", "draw the architecture", "visualize", "D2", "TALA", "mermaid", "draw.io", "OCI icons", "sequence diagram".
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# Architecture diagramming

Content as of 2026-01-06. Tool versions, CLI flags and download locations below were not re-checked on
2026-10-05; confirm on the linked primary source before quoting.

Diagram-as-code for cloud solutions, with OCI examples. Pick the tool by audience and output format.

## Tool selection matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIAGRAMMING TOOL SELECTION                    │
├──────────────────┬──────────────┬──────────────────────────────┤
│ Tool             │ Best For     │ Output                       │
├──────────────────┼──────────────┼──────────────────────────────┤
│ D2               │ Architecture │ SVG, PNG, PDF (beautiful)    │
│ Mermaid          │ Flows, Seq   │ SVG (markdown embedded)      │
│ Draw.io          │ Complex, OCI │ PNG, SVG, PDF (icon-rich)    │
│ PlantUML         │ UML, Legacy  │ PNG, SVG                     │
│ ASCII            │ Quick, Docs  │ Text (inline)                │
└──────────────────┴──────────────┴──────────────────────────────┘

RECOMMENDATION:
- High-quality architecture → D2 with TALA layout
- OCI-specific with icons → Draw.io with OCI toolkit
- Quick documentation → Mermaid (renders in GitHub)
- Inline in code/docs → ASCII art
```

## D2 language (recommended for architecture)

### Why D2
- **Text-based**: Version control friendly
- **Polished output**: SVG/PNG/PDF
- **TALA layout**: Designed for architecture diagrams (a separately licensed layout engine; see https://d2lang.com/tour/tala)
- **Grid layouts**: Suited to layered architectures
- **Community**: star count [OPEN], read https://github.com/terrastruct/d2 rather than quoting a remembered figure

Versions: the earlier note said "D2 0.7+" as of 2026-01-06 [UNVERIFIED]; current release at
https://github.com/terrastruct/d2/releases.

### Installation
```bash
# macOS
brew install d2

# Windows (via Chocolatey)
choco install d2

# Linux
curl -fsSL https://d2lang.com/install.sh | sh -s --

# Verify
d2 --version
```

### D2 Basic Syntax
```d2
# Nodes
server: Web Server
database: PostgreSQL {
  shape: cylinder
}

# Connections
server -> database: SQL queries

# Styling
server.style: {
  fill: "#4A90D9"
  stroke: "#2E5A8B"
}

# Labels
server -> database: {
  style.stroke: "#28a745"
  style.stroke-width: 2
}
```

### D2 templates

A layered OCI generative AI template and a three-cloud gateway template are in
[references/d2-templates.md](references/d2-templates.md).

### Compile D2 Diagrams
```bash
# Basic export
d2 input.d2 output.svg

# With TALA layout (best for architecture)
d2 --layout=tala input.d2 output.svg

# PNG output
d2 --layout=tala input.d2 output.png

# Dark theme
d2 --theme=200 input.d2 output.svg

# Watch mode (auto-refresh)
d2 --watch input.d2 output.svg
```

## Draw.io with OCI Icons

### OCI icon toolkit

Oracle publishes architecture diagram toolkits on its public docs; follow the toolkit's usage terms
and do not present a diagram as Oracle's own.

**Download location:**
https://docs.oracle.com/en-us/iaas/Content/General/Reference/graphicsfordiagrams.htm

**Available Formats:**
- Draw.io XML library
- PowerPoint (PPTX)
- SVG icons
- PNG icons
- Visio stencils

### Setup Draw.io with OCI Icons
```
1. Download OCI icon library from Oracle docs
2. Open Draw.io (desktop or web)
3. File → Open Library From → Device
4. Select the OCI .xml file
5. Icons appear in left sidebar under "OCI"
```

### Draw.io CLI Export
```bash
# Install Draw.io desktop first
# Then use CLI:

# Export to PNG
draw.io --export --format png --output diagram.png diagram.drawio

# Export to SVG
draw.io --export --format svg --output diagram.svg diagram.drawio

# Export specific page
draw.io --export --page-index 0 --output page1.png diagram.drawio

# Export all pages
draw.io --export --all-pages --output diagrams/ diagram.drawio

# High resolution
draw.io --export --format png --scale 2 --output hires.png diagram.drawio
```

### Draw.io Automation Script
```bash
#!/bin/bash
# export_diagrams.sh - Export all Draw.io diagrams

DIAGRAMS_DIR="./diagrams"
OUTPUT_DIR="./exports"

mkdir -p "$OUTPUT_DIR"

for file in "$DIAGRAMS_DIR"/*.drawio; do
    filename=$(basename "$file" .drawio)

    # Export PNG
    draw.io --export --format png --scale 2 \
            --output "$OUTPUT_DIR/${filename}.png" "$file"

    # Export SVG
    draw.io --export --format svg \
            --output "$OUTPUT_DIR/${filename}.svg" "$file"

    echo "Exported: $filename"
done
```

## Mermaid (Documentation-Friendly)

### When to Use Mermaid
- Renders in GitHub markdown
- Quick sequence diagrams
- Flowcharts in documentation
- No export step needed

### Mermaid Architecture Diagram
```mermaid
flowchart TB
    subgraph Users["Users"]
        Web[Web App]
        Mobile[Mobile App]
    end

    subgraph OCI["Oracle Cloud Infrastructure"]
        subgraph Network["Network Layer"]
            LB[Load Balancer]
            WAF[WAF]
        end

        subgraph Compute["Compute Layer"]
            API[API Gateway]
            OKE[OKE Cluster]
        end

        subgraph AI["AI Layer"]
            DAC[Dedicated AI Cluster]
            Agent[GenAI Agent]
            KB[Knowledge Base]
        end

        subgraph Data["Data Layer"]
            ADB[(Autonomous DB)]
            OBJ[(Object Storage)]
        end
    end

    Web --> LB
    Mobile --> LB
    LB --> WAF
    WAF --> API
    API --> OKE
    OKE --> Agent
    Agent --> DAC
    Agent --> KB
    KB --> OBJ
    KB --> ADB

    style DAC fill:#4CAF50,color:#fff
    style Agent fill:#81C784
    style KB fill:#A5D6A7
```

### Mermaid Sequence Diagram
```mermaid
sequenceDiagram
    participant User
    participant Gateway as AI Gateway
    participant Agent as GenAI Agent
    participant KB as Knowledge Base
    participant DAC as Dedicated AI Cluster

    User->>Gateway: Ask question
    Gateway->>Agent: Route to agent
    Agent->>KB: RAG query
    KB-->>Agent: Retrieved context
    Agent->>DAC: Generate with context
    DAC-->>Agent: Response
    Agent-->>Gateway: Formatted response
    Gateway-->>User: Answer with citations
```

## ASCII Art (Quick Documentation)

### OCI Architecture ASCII Template
```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Load Balancer    │
                    │    (Public Subnet)  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼─────────┐     │     ┌──────────▼─────────┐
    │   Web Server 1    │     │     │   Web Server 2     │
    │  (Private Subnet) │     │     │  (Private Subnet)  │
    └─────────┬─────────┘     │     └──────────┬─────────┘
              │               │                │
              └───────────────┼────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │   GenAI DAC         │
                   │  ┌────┐ ┌────┐      │
                   │  │GPU │ │GPU │ ...  │
                   │  └────┘ └────┘      │
                   └──────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼─────┐  ┌──────▼──────┐  ┌────▼────────┐
    │ Knowledge     │  │ Autonomous  │  │ Object      │
    │ Base          │  │ Database    │  │ Storage     │
    └───────────────┘  └─────────────┘  └─────────────┘
```

## Best Practices

### Architecture Diagram Standards
```yaml
Layering:
  1. Use consistent layer structure:
     - Presentation (users, CDN)
     - Network (LB, WAF, Gateway)
     - Compute (servers, containers)
     - AI/ML (models, agents)
     - Data (databases, storage)

Color Coding:
  - Blue: Network/Infrastructure
  - Green: AI/ML services
  - Purple: Data/Storage
  - Orange: Compute
  - Gray: External/Users

Connections:
  - Solid lines: Primary flow
  - Dashed lines: Optional/backup
  - Thick lines: High bandwidth
  - Labeled: Protocol/purpose

Labels:
  - Service names (official names)
  - Port numbers where relevant
  - Data flow direction
  - Capacity/sizing info
```

### OCI Diagram Conventions
```yaml
Shapes (OCI Standard):
  - Rectangle: Compute, Containers
  - Cylinder: Databases, Storage
  - Hexagon: Load Balancers, Gateways
  - Rounded: Services, Functions
  - Diamond: Decision points

Regions & Compartments:
  - Use nested boxes for hierarchy
  - Label regions (us-ashburn-1)
  - Show compartment structure
  - Indicate availability domains

Security:
  - Show VCN boundaries
  - Indicate public vs private subnets
  - Mark security lists/NSGs
  - Show encryption points
```

## Workflow: Generate Architecture Diagram

### Step 1: Gather Requirements
```
- What is the system doing?
- What OCI services are used?
- What are the data flows?
- What security boundaries exist?
- Who is the audience (technical vs exec)?
```

### Step 2: Choose Tool
```
High-quality for presentation → D2 with TALA
Need OCI icons → Draw.io with toolkit
In documentation → Mermaid
Quick sketch → ASCII
```

### Step 3: Create Diagram
```
1. Start with layers (top-to-bottom or left-to-right)
2. Add major components
3. Draw primary data flows
4. Add secondary/fallback paths
5. Apply styling and colors
6. Add labels and annotations
```

### Step 4: Export
```bash
# D2
d2 --layout=tala --theme=0 architecture.d2 architecture.svg
d2 --layout=tala architecture.d2 architecture.png

# Draw.io
draw.io --export --format png --scale 2 architecture.drawio

# Mermaid (use GitHub or mmdc CLI)
npx @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.svg
```

## Resources

### D2 Language
- [D2 Documentation](https://d2lang.com/)
- [D2 GitHub](https://github.com/terrastruct/d2)
- [D2 Playground](https://play.d2lang.com/)

### Draw.io
- [Draw.io Documentation](https://www.drawio.com/doc/)
- [Draw.io CLI](https://github.com/rlespinasse/drawio-cli)

### OCI Icons
- [OCI Architecture Diagram Toolkits](https://docs.oracle.com/en-us/iaas/Content/General/Reference/graphicsfordiagrams.htm)
- [Oracle Blog: Layered Architecture Diagrams](https://blogs.oracle.com/cloud-infrastructure/layered-architecture-diagrams-drawio)

### Mermaid
- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/.
- 1.1.0: content as of 2026-01-06 (D2 0.7+).
