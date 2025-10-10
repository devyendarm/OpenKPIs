# Contributing to OpenKPIs

Thank you for your interest in contributing to OpenKPIs! This guide will help you understand how to contribute effectively to our open-source KPI definitions repository.

## 🚀 Quick Start

### 1. Create a New KPI/Event/Dimension

**Option A: Web Interface (Recommended)**
1. Visit [https://openkpis.org/kpis/new](https://openkpis.org/kpis/new)
2. Sign in with GitHub
3. Fill out the form with your KPI details
4. Submit to create a pull request automatically

**Option B: Manual Process**
1. Fork the repository
2. Create YAML files in `data-layer/` directories
3. Submit a pull request

### 2. Edit Existing Content

1. Navigate to any KPI/Event/Dimension page
2. Click the "Edit" button
3. Make your changes inline
4. Save to create a pull request

## 📋 Contribution Workflow

### New KPI Creation Flow

```
New KPI → Web Form → Auto-Generated PR → Review → Merge → Live on Site
```

1. **Create**: Use the web form at `/kpis/new`
2. **Review**: Maintainers review your submission
3. **Verify**: Content gets verified by maintainers
4. **Merge**: PR is merged to main branch
5. **Deploy**: Changes go live on the website

### Inline Editing Flow

```
Existing Page → Edit Mode → Save Changes → PR Update → Review → Merge
```

1. **Edit**: Click "Edit" on any KPI/Event/Dimension page
2. **Modify**: Make changes to YAML and MDX content
3. **Save**: Submit changes as PR updates
4. **Review**: Maintainers review changes
5. **Merge**: Approved changes go live

## 📁 Repository Structure

```
openkpis/
├── data-layer/           # Source YAML files
│   ├── kpis/            # KPI definitions
│   ├── events/          # Event definitions
│   └── dimensions/      # Dimension definitions
├── docs/                # Generated MDX files
│   ├── kpis/           # KPI documentation
│   ├── events/         # Event documentation
│   └── dimensions/     # Dimension documentation
├── src/                # Docusaurus source
├── scripts/            # Generation scripts
└── cloudflare/         # Cloudflare Worker
```

## 📝 Content Guidelines

### YAML Structure

Each KPI/Event/Dimension should follow this structure:

```yaml
KPI Name: Orders
Description: Total number of completed transactions
KPI Alias:
- Purchases
- Completed Transactions
Metric: Count of purchase events
GA Events Name: purchase
Adobe Analytics Event Name: purchase
Amplitude Event Name: Order Completed
Industry:
- Retail
- eCommerce
Category: Conversion
KPI Type: Counter (Unique)
Formula: Orders = COUNT(DISTINCT order_id)
Scope: Session or User
Priority: High
Core Area: Conversion / Sales Funnel
BI Source System:
- GA4
- Adobe Analytics
- Amplitude
Data Layer Mapping: "{\"event\": \"purchase\", \"transaction_id\": \"T_12345\"}"
XDM Mapping: "{\"eventType\": \"commerce.purchases\"}"
Dependencies: Requires accurate capture of Order ID
Report Attribute:
- Order ID
- Transaction Date
- Revenue
Dashboard Usage:
- Used in Conversion dashboards
- Revenue tracking
Segment Eligibility: All Users who triggered purchase event
SQL Query Example:
- sql<br>SELECT COUNT(DISTINCT order_id) AS total_orders<br>FROM ecommerce_events<br>WHERE event_name = 'purchase'
Aggregation Window:
- Daily
- Weekly
- Monthly
Calculation Notes:
- Filter duplicate transactions by unique order_id
- Exclude test transactions
Contributed By: Your Name
Validation Status: Unverified
Owner: Digital Analytics Team
Tags: '#Conversion #Ecommerce #Orders'
Data Sensitivity: Low
PII Flag: false
Version: v1.0
Dimensions:
- order_id
- channel
- campaign
Details: Tracks completed purchase transactions
Last Updated: '2025-01-01T00:00:00.000Z'
```

### Required Fields

**For KPIs:**
- KPI Name
- Description
- Formula
- Industry
- Category
- KPI Type

**For Events:**
- Event Name
- Description
- Event Type
- Trigger
- Required Fields

**For Dimensions:**
- Dimension Name
- Description
- Data Type
- Scope

### Validation Status

- **Unverified**: Default for new contributions
- **Verified**: Only maintainers can set this status
- **Deprecated**: For outdated definitions

## 🔒 Governance & Quality Control

### Verified Status Policy

**Important**: Only maintainers can set `status: "Verified"` or `Validation Status: "Validated"`.

**For Contributors**:
- Your contributions start as "Unverified"
- This is normal and expected
- Maintainers will review and verify quality

**For Maintainers**:
- Can set verified status directly
- Can add `verified-ok` label to PRs
- Ensure content meets quality standards

### Quality Standards

1. **Accuracy**: Information must be technically correct
2. **Completeness**: All required fields must be filled
3. **Clarity**: Descriptions should be clear and understandable
4. **Consistency**: Follow existing patterns and formats
5. **Relevance**: Content should be useful for analytics practitioners

### Review Process

1. **Automated Checks**: YAML validation, syntax checking
2. **Peer Review**: Community members can review PRs
3. **Maintainer Review**: Final approval by maintainers
4. **Verification**: Content marked as verified after review

## 🛠️ Technical Details

### Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/devyendarm/OpenKPIs.git
   cd OpenKPIs
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Generate Content**:
   ```bash
   npm run generate
   ```

4. **Start Development Server**:
   ```bash
   npm run start
   ```

### File Generation

The repository uses automated generation from YAML to MDX:

- **Source**: YAML files in `data-layer/`
- **Output**: MDX files in `docs/`
- **Script**: `scripts/generate-from-yaml.js`

### Cloudflare Worker

Authentication and content management handled by Cloudflare Worker:

- **OAuth**: GitHub authentication
- **Rate Limiting**: 20 requests/minute, 100/day
- **Content Management**: File creation and updates
- **PR Management**: Automatic pull request creation

## 🤝 Community Guidelines

### Code of Conduct

1. **Be Respectful**: Treat all contributors with respect
2. **Be Constructive**: Provide helpful feedback and suggestions
3. **Be Collaborative**: Work together to improve the project
4. **Be Professional**: Maintain a professional tone in discussions

### Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions or share ideas
- **Pull Requests**: Contribute code and content
- **Documentation**: Check existing docs first

### Recognition

Contributors are recognized through:
- GitHub contributor list
- Release notes
- Community highlights
- Contributor badges

## 📚 Resources

### Documentation
- [OpenKPIs Website](https://openkpis.org)
- [GitHub Repository](https://github.com/devyendarm/OpenKPIs)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

### Tools
- [YAML Validator](https://www.yamllint.com/)
- [Markdown Editor](https://dillinger.io/)
- [GitHub Desktop](https://desktop.github.com/)

### Learning
- [Analytics Best Practices](https://analyticsthinking.com)
- [KPI Definition Guide](./docs/kpi-definition-guide.md)
- [Event Tracking Guide](./docs/event-tracking-guide.md)

## 🎯 Contribution Ideas

### Content Contributions
- [ ] New KPI definitions
- [ ] Event tracking specifications
- [ ] Dimension definitions
- [ ] Industry-specific packs
- [ ] Platform-specific mappings

### Technical Contributions
- [ ] Bug fixes
- [ ] Feature enhancements
- [ ] Documentation improvements
- [ ] Testing and validation
- [ ] Performance optimizations

### Community Contributions
- [ ] Answering questions
- [ ] Reviewing PRs
- [ ] Sharing knowledge
- [ ] Organizing events
- [ ] Promoting the project

## 📞 Contact

- **Maintainer**: @devyendarm
- **Email**: [Contact through GitHub](https://github.com/devyendarm)
- **Website**: [https://openkpis.org](https://openkpis.org)
- **Discussions**: [GitHub Discussions](https://github.com/devyendarm/OpenKPIs/discussions)

---

Thank you for contributing to OpenKPIs! Together, we're building a better future for analytics standardization. 🚀