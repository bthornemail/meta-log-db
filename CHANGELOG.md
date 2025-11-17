# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-01-XX

### Added
- **Format Fibration Extension**: Chain complex format export following A₁₁ specification
  - `FormatExporter` class for exporting chain complexes to 0D-4D formats
  - Format fibration: CANVASL (4D) → TopoJSON (3D) → GeoJSON (2D) → JSONL (1D) → JSON Canvas (0D)
  - Boundary operators: `∂₄`, `∂₃`, `∂₂`, `∂₁` for format downgrades
  - R5RS functions: `r5rs:create-cell`, `r5rs:build-chain-complex`, `r5rs:format-fibration`, `r5rs:export-0d`, `r5rs:export-1d`, `r5rs:export-2d`, `r5rs:export-3d`, `r5rs:export-4d`, `r5rs:topojson-to-geojson`, `r5rs:geojson-to-jsonl`, `r5rs:jsonl-to-json-canvas`
  - Extends 0D-7D dimensional system with chain complex structure (C₀-C₄)
  - Integrates with existing Homology extension for validation
  - **NO networking** - networking stays in `automata-metaverse` package

## [1.2.0] - 2025-01-XX

### Added
- **Chain Complex & Homology Extension**: Algebraic topology validation with ∂² = 0 property checking
  - `HomologyValidator` class for chain complex validation
  - Betti number computation (β₀-β₄)
  - Euler characteristic calculation
  - R5RS functions: `r5rs:validate-homology`, `r5rs:compute-betti`, `r5rs:compute-euler-characteristic`, `r5rs:boundary-operator`
- **MetaLogNode Extension**: Atemporal DAG node structure with cryptographic identity
  - `MetaLogNodeManager` for node creation and verification
  - CID computation from content
  - BIP32 path derivation
  - Node signing and verification
  - R5RS functions: `r5rs:create-metalog-node`, `r5rs:verify-metalog-node`, `r5rs:compute-cid`
- **Projective/Affine Geometry Extension**: Coordinate system transformations
  - `ProjectiveAffineConverter` for coordinate conversions
  - Affine to projective coordinate transformation
  - Projective to affine coordinate transformation
  - R5RS functions: `r5rs:affine-to-projective`, `r5rs:projective-to-affine`
- **DAG Operations Extension**: Directed Acyclic Graph management
  - `DAGManager` for DAG operations
  - Lowest Common Ancestor (LCA) finding
  - Ancestor and descendant queries
  - Cycle detection
  - R5RS functions: `r5rs:find-lca`, `r5rs:get-children`, `r5rs:get-ancestors`
- **Org Mode R5RS Functions Extension**: Org Mode document parsing
  - Org Mode document parsing using `orga` package
  - Heading extraction with hierarchy
  - Source block extraction
  - Property drawer extraction
  - Noweb reference expansion
  - R5RS functions: `r5rs:parse-org-document`, `r5rs:extract-headings`, `r5rs:extract-source-blocks`, `r5rs:extract-property-drawers`, `r5rs:expand-noweb`
- Extension configuration flags: `enableHomology`, `enableMetaLogNode`, `enableProjectiveAffine`, `enableDAG`, `enableOrgMode`
- Extension methods in `MetaLogDb` and `MetaLogDbBrowser`: `validateHomology()`, `computeBetti()`

### Dependencies
- Added `orga@^4.5.1` for Org Mode parsing support

### Documentation
- Updated README.md with extension documentation and usage examples
- All extensions are optional and disabled by default for backward compatibility

## [1.0.0] - 2025-01-17

### Added
- Initial release of Meta-Log Database package
- ProLog Engine with unification and SLD resolution
- DataLog Engine with fact extraction and bottom-up evaluation
- R5RS Integration with function registry and execution
- JSONL/CanvasL Parser for file format parsing and fact extraction
- RDF/SPARQL Support with triple storage and SPARQL query execution
- SHACL Validation with shape constraint validation
- Browser support with CanvasLMetaverseBrowser unified API
- IndexedDB storage for browser environments
- Comprehensive TypeScript type definitions
- RFC2119 specification document
- Complete API documentation
- Real-world usage examples
- Migration guide from MetaLogBrowserAdapter
- Testing guide with Jest configuration
- GitHub Pages documentation site

### Documentation
- Complete README with installation and usage instructions
- API reference documentation
- Examples for R5RS, SHACL, and SPARQL
- Glossary of key terms
- Frontmatter validation setup guide
- Linking setup guide

### Infrastructure
- GitHub Actions CI/CD workflow
- Automated testing on Node.js 18.x and 20.x
- Code coverage reporting
- npm package publishing configuration
- GitHub Pages with Jekyll

[1.0.0]: https://github.com/bthornemail/meta-log-db/releases/tag/v1.0.0

