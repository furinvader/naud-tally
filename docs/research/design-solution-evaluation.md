# Design Solution Evaluation

## Question

- Which browser-accessible design solution best fits this project for human collaboration and AI-friendly handoff?

## Related tasks

- [T-010 Choose a Design Solution](../tasks/done/T-010.md)
- [T-011 Document the Penpot Handoff Workflow](../tasks/done/T-011.md)

## Related docs

- [Product Scope](../product.md)
- [Agentic Workflow](../agentic-workflow.md)

## Research snapshot

- April 1, 2026

## Evaluation checklist

- Can a 3-screen flow be created and shared in the browser quickly?
- Can non-editors review the design cleanly without setup friction?
- Can the tool describe layouts, spacing, colors, and interaction states clearly enough for an AI agent to implement them accurately?
- Can the output be exported or inspected in a way that feels durable enough to avoid tool lock-in?
- Does the free tier remain useful for a very small project?
- If the free tier is not enough, does the paid path still feel reasonable for one or two humans?

## Sources

- [Penpot Home](https://penpot.app/)
- [Penpot Prototyping](https://penpot.app/design/prototyping)
- [Penpot Share Prototype Links](https://help.penpot.app/user-guide/prototyping-testing/testing-view-mode/)
- [Penpot Export and Import](https://help.penpot.app/user-guide/export-import/export-import-files/)
- [Penpot Dev Tools](https://help.penpot.app/user-guide/dev-tools/)
- [Penpot Pricing Overview](https://community.penpot.app/t/penpots-pricing-all-you-need-to-know/8131)
- [Penpot Enterprise and MCP Positioning](https://penpot.app/penpot-enterprise)
- [Penpot MCP Server](https://github.com/penpot/penpot-mcp)
- [Figma Pricing](https://www.figma.com/pricing/)
- [Figma Sharing and Permissions](https://help.figma.com/hc/en-us/articles/1500007609322-Guide-to-sharing-and-permissions)
- [Figma Make Overview](https://help.figma.com/hc/en-us/articles/31304412302231-Explore-Figma-Make)
- [Figma Make Publishing](https://help.figma.com/hc/en-us/articles/31304586129559-Publish-update-or-unpublish-a-Figma-Make-file)
- [Figma MCP Server Guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [Figma Make Custom MCP Connectors](https://help.figma.com/hc/en-us/articles/38147204302743-Create-and-use-custom-MCP-connectors-in-Figma-Make)
- [Uizard Pricing](https://uizard.io/pricing/)
- [Uizard Sharing](https://support.uizard.io/en/articles/6380408-sharing-projects)
- [Uizard Exporting](https://support.uizard.io/en/articles/6380330-exporting-projects)
- [Pixso Developer MCP Guide](https://pixso.net/developer/en/mcp/remote-mcp.html)
- [Framer AI](https://www.framer.com/ai/)
- [Framer Pricing](https://www.framer.com/pricing/)
- [Storybook Overview](https://storybook.js.org/docs/)
- [Publish Storybook](https://storybook.js.org/docs/sharing/publish-storybook/)

## Findings

### Penpot

- Strength: browser-based with shareable prototype links.
- Strength: strongest match for the optional Codex-readable-format preference because it emphasizes open standards and code-oriented inspect output.
- Strength: supports inspect and code workflows around CSS, SVG, and HTML.
- Strength: open source and self-hostable, which lowers long-term lock-in risk.
- Strength: now has an official MCP server project, which makes it more credible for future agent workflows.
- Open question: the hosted pricing story is less straightforward than Figma's public pricing page.
- Open question: the practical quality of its AI-agent workflow still needs validation in real use.

### Figma

- Strength: strongest first-party AI story in this comparison.
- Strength: Figma Make supports prompt-driven creation of functional prototypes, web apps, and interactive UI.
- Strength: sharing and browser access are mature and widely understood.
- Strength: Figma now documents both an MCP server and custom MCP connectors for Make.
- Strength: its pricing page is clearer than Penpot's for small-team evaluation.
- Open question: AI-credit usage is difficult to predict before real usage.
- Open question: the strongest AI workflows are still more attractive on paid plans and Full seats.
- Open question: it is a more proprietary ecosystem and a weaker match for the optional readable-file preference.

### Storybook

- Note: Storybook is likely valuable later to document component behavior and professionalism, but it should be treated as a companion layer after the primary design tool is chosen.

### Uizard

- Note: strongest AI-first fallback candidate found so far.
- Note: browser-based, shareable, free to start, and explicitly offers CSS and React handoff on paid plans.
- Note: weaker than Penpot and Figma on openness and long-term agent integration.

### Pixso

- Note: most interesting dark horse after the primary shortlist.
- Note: browser-based collaboration with an MCP guide, but it needs more trust and workflow validation before being recommended above Penpot or Figma.

### Framer

- Note: capable and AI-assisted, but it appears more aligned with designing and publishing websites than with maintaining the main product-design source for this app.
