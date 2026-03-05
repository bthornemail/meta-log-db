# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-XX

### Added

- **E8 Lattice Module**: Complete TypeScript implementation of E8 exceptional Lie algebra
  - `E8Lattice` class with 240 roots construction
  - BIP32 path to E8 point mapping (`bip32ToE8`)
  - Weyl group operations (`weylOrbit`)
  - p-adic height computation (`padicHeight`)
  - Shortest path finding (A* algorithm)
  - FRBAC delegation verification
  - Distance metrics for ML features

- **E8 Theta Series Module**: Weight-4 modular form implementation
  - `E8ThetaSeries` class for theta series computation
  - Coefficient computation (`coefficient`, `r_E8(n)`)
  - QQF (Quaternary Quadratic Form) linkage
  - Quorum stability prediction
  - Modular form evaluation

- **New Exports**: E8 modules available via `meta-log-db/e8` export path

- **Comprehensive Tests**: Full test suite for E8 modules
  - Lattice operations tests
  - Theta series tests
  - Integration tests

### Changed

- Updated package description to include E8 Lattice support
- Added E8-related keywords to package.json

## [1.0.0] - Initial Release

### Added

- MetaLogDb core database class
- PrologEngine for logic programming
- DatalogEngine for deductive database queries
- R5RSRegistry for Scheme code execution
- JsonlParser for JSONL file parsing
- TripleStore for RDF data management
- ShaclValidator for SHACL validation
- Browser support with IndexedDB storage
