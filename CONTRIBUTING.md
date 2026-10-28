# Contributing to SMETP

We welcome contributions from researchers, practitioners, and domain experts!

## How to Contribute

### 1. Share Your Expertise (Create a Skill)

**For SMEs**: Extract your knowledge as a skill document

1. Follow [`GETTING_STARTED.md`](GETTING_STARTED.md) and the interview template for your domain. That is the path this repo supports.
2. Choose your domain and role
3. Answer the interview questions
4. Write the skill document by hand (JSON, same shape as the examples)
5. Compare it to cases you can share. Do not invent an accuracy figure.
6. Submit to `/examples` folder, and read [`examples/README.md`](examples/README.md) first

A browser interview on another site is optional. It was not verified as part of the docs in this repo, and this repo does not export the result to a chat product.

**Format**: Name it `domain_skillname.json`

Example: `finance_credit_risk_assessment.json`

### 2. Add Scientific References

Found a paper relevant to SMETP?

1. Update the relevant section in `FRAMEWORK.md`
2. Add citation: Author (Year) - Title
3. Submit as pull request

### 3. Improve Documentation

- Fix typos or clarifications
- Add examples for specific domains
- Improve clarity of framework sections
- Expand validation guidance

### 4. Add Domain-Specific Guidance

Help us cover more domains!

Create a new file: `domains/DOMAIN_NAME.md`

Include:
- Domain overview
- Key metrics and ontologies
- Common edge cases
- Heuristics SMEs use
- Scientific references
- Example interview questions

### 5. Create Interview Templates

Help SMEs extract expertise faster!

Create: `templates/DOMAIN_ROLE_interview_template.md`

Include:
- 10-15 domain-specific questions
- Explanation of why each question matters
- Expected answer patterns
- How to follow up

### 6. Build Tools

Help automate the SMETP process!

- Interview generators
- Decision tree visualizers
- Validation tools
- Export converters
- Analytics dashboards

## Guidelines

### Code of Conduct

- **Respectful**: Treat all contributors with respect
- **Inclusive**: Welcome all backgrounds and experience levels
- **Scientific**: Ground contributions in research where possible
- **Open**: Share knowledge generously

### Submission Standards

**For Skills**:
- Inputs, decision tree, outcomes, and escalation are explicit
- Published test cases match the tree, or the mismatch is called out in the PR
- No accuracy percentage unless a write-up under `docs/benchmarks/` states the method and the caveats
- Clear edge cases documented
- No claim that the file is an npm package or a drop-in adapter for a chat product

**For Documentation**:
- Clear and concise writing
- Include examples
- Cite scientific sources
- Format consistently

**For Code/Tools**:
- Well-commented
- Clear README
- Test coverage
- Open source license (MIT preferred)

## Pull Request Process

1. **Fork** the repository
2. **Create a branch**: `feature/your-contribution`
3. **Make changes** following guidelines
4. **Test** thoroughly
5. **Submit PR** with clear description of:
   - What you added
   - Why it matters
   - How to use it
   - References (if applicable)

## Areas We Need Help With

- [ ] Healthcare domain skills (differential diagnosis, risk stratification)
- [ ] Legal domain skills (contract analysis, due diligence)
- [ ] Insurance domain skills (claims assessment, underwriting)
- [ ] Manufacturing domain skills (quality control, maintenance)
- [ ] Sales domain skills (lead scoring, forecasting)
- [ ] Cybersecurity domain skills (threat detection, incident response)
- [ ] Case studies documenting SMETP implementation
- [ ] Video tutorials explaining the framework
- [ ] A public benchmark harness, a JSON Schema validator, and (later) an MCP server. None of these are shipped. Adapters for individual chat products are not shipped.

## Questions?

- **GitHub Issues**: Ask questions, suggest improvements. Use the issue templates.
- **Discussions**: Not enabled on this repo yet. Draft posts are in [`docs/benchmarks/discussions-draft.md`](docs/benchmarks/discussions-draft.md).
- **Email**: contact@ieataiforbreakfast.com

---

**Thank you for contributing to SMETP!**

Together, we're capturing expert knowledge before it's lost forever.
