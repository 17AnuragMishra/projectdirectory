# Contributing to ProjectRevive

Thank you for your interest in contributing to **ProjectRevive**! We welcome contributions from developers of all skill levels.

---

## Code of Conduct

Please be respectful, collaborative, and constructive when interacting with maintainers and fellow contributors.

---

## How Can I Contribute?

1. **Reporting Bugs**: Open an issue describing the bug, steps to reproduce, and expected behavior.
2. **Suggesting Enhancements**: Propose new features or improvements by opening an issue for discussion.
3. **Submitting Pull Requests**:
   - Fork the repository and create a new branch from `main`.
   - Ensure your code follows the existing style conventions (TypeScript strict typing, Tailwind CSS, modular components).
   - Verify that your changes build cleanly with `npm run build` and have no lint/type errors.
   - Open a clear Pull Request with a description of the changes.

---

## Development Setup

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/projectdirectory.git
cd projectdirectory

# 2. Install dependencies
npm install

# 3. Setup .env.local
cp .env.local.example .env.local # or configure your variables

# 4. Start local development
npm run dev

# 5. Build validation
npm run build
```

---

## License

By contributing to ProjectRevive, you agree that your contributions will be licensed under the [GNU Affero General Public License v3.0](LICENSE).
