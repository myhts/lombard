# Lombard

An AI pawnbroker in 1750s London. Bring it a silver watch or a silk gown. It values the item from real Old Bailey
trials, with the trial cited, and lends within limits set in code. It also watches for stolen goods and swindlers.
People, or AI customer agents with secret character cards, try to fool it.

**Status:** planning. The design is in [docs/plans/0011-lombard-ai-pawnbroker.md](docs/plans/0011-lombard-ai-pawnbroker.md).

**Built with:**
- TypeScript, Next.js and Postgres with pgvector;
- Claude Haiku 5.5 for the agents;
- Voyage AI for embeddings;
- MCP servers for Claude Desktop.

It's delivered with [claude-kits](https://github.com/myhts/claude-kits): every change is planned, built test-first,
reviewed by agents and then by a person, and merged by a person.

## Data and attribution

The trial records come from *The Old Bailey Proceedings Online, 1674–1913* (version 7.2), through the Hugging Face
dataset [`biglam/old_bailey_proceedings`](https://huggingface.co/datasets/biglam/old_bailey_proceedings), and are
licensed [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
- Lombard is non-commercial.
- The data is downloaded by a script and never committed.
- The full citation arrives with the download script.

The customers are fictional characters drawn from the records, and each one cites the trial behind it.
