# 🧭 OpenKPIs

### **The Open Standard for Digital, Business & Data KPIs**

**OpenKPIs** is an open-source, community-driven framework designed to standardize the way **Key Performance Indicators (KPIs)**, **metrics**, **events**, and **dimensions** are defined, documented, and shared across industries and analytics platforms.  

Our mission is to create a **universal, platform-agnostic KPI taxonomy** that bridges the gap between **business goals**, **data instrumentation**, and **reporting systems** — empowering teams to build consistent, scalable, and interoperable analytics ecosystems.

---

## 🌍 Vision

> “To make KPIs universally understood, reusable, and interoperable — enabling data-driven decision-making through open collaboration.”

Today’s analytics landscape is fragmented: every organization reinvents metrics and events for the same goals — *“What is a conversion?”, “How do we define engagement?”, “What is bounce rate?”*  

**OpenKPIs** envisions a future where:
- Every KPI, metric, event, and dimension is **documented in a shared, machine-readable schema**.  
- Analysts, developers, and marketers can **collaborate on one standard language** for analytics.  
- **Open frameworks** power **consistent dashboards, attribution models, and AI-driven insights** across tools.

---

## 🎯 Purpose

OpenKPIs serves as both a **knowledge repository** and a **technical framework** for:
- ✅ **Documenting** KPIs, metrics, events, and dimensions across tools like **Google Analytics, Adobe Analytics, Amplitude, and AEP**  
- ✅ **Standardizing definitions** across industries (Retail, BFSI, SaaS, Healthcare, Education, etc.)  
- ✅ **Mapping** KPIs to **data models** (XDM, GA4, SQL, BI schemas)  
- ✅ **Accelerating analytics onboarding** and **reducing documentation overhead**  
- ✅ **Empowering open contributions** from practitioners around the world  

---

## 👥 Who It’s For

| Role | How OpenKPIs Helps |
|------|--------------------|
| **Data Analysts** | Access standardized KPI definitions, formulas, and mappings for quick adoption. |
| **Developers / Data Engineers** | Integrate open data layer and XDM mappings for event tracking consistency. |
| **Product Managers** | Align business KPIs to measurable, trackable metrics. |
| **MarTech Architects** | Implement cross-platform instrumentation across GA, AEP, and Amplitude. |
| **Educators & Students** | Learn the foundations of analytics with open reference templates. |
| **Researchers & Contributors** | Extend, fork, and improve definitions — contributing to the open analytics ecosystem. |

---

## ⚙️ How It Works

OpenKPIs organizes knowledge into **four core entities**:

1. **KPIs** → Strategic measures that reflect performance goals (e.g., *Conversion Rate*, *Average Order Value*)  
2. **Metrics** → Quantitative components that power KPIs (e.g., *Revenue*, *Orders*)  
3. **Events** → Behavioral actions that generate metrics (e.g., *purchase*, *add_to_cart*)  
4. **Dimensions** → Contextual attributes for segmentation (e.g., *Page Name*, *Device Type*, *Traffic Source*)

Each entity is represented as **structured YAML / JSON files** and linked together through relationships:

```
KPI  →  Metric(s)  →  Event(s)  →  Dimension(s)
```

These entities can be used for:
- Building **dashboards** and **data models**
- Generating **SQL templates**
- Creating **XDM schemas**
- Validating **data layer mappings**

---

## 📁 Repository Structure

```
openkpis/
│
├── kpis/                  # KPI definitions (YAML/JSON)
├── metrics/               # Metric definitions
├── events/                # Event documentation
├── dimensions/            # Dimension documentation
├── templates/             # Excel, YAML, and JSON schema templates
├── examples/              # Sample payloads (GA4, XDM, ACDL)
├── scripts/               # Converters, validators, and enrichment tools
└── README.md              # You are here 🚀
```

---

## 🧩 Example: KPI Definition (Orders)

```yaml
kpi_id: KPI_001
kpi_name: Orders
description: Total number of completed transactions.
metric: order_count
ga_events_name: purchase
adobe_analytics_event_name: purchase
amplitude_event_name: Purchase Completed
industry: Retail
category: E-commerce
kpi_type: Counter
formula: SUM(order_count)
scope: Session
priority: High
core_area: Commerce
bi_source_system: Data Warehouse
data_layer_mapping: commerce.order.purchaseID
xdm_mapping: xdm.commerce.order.purchaseID
dependencies: metrics/order_count.yaml
report_attribute: Total Orders
dashboard_usage: Sales Overview
```

---

## 🛠️ Intended Use

OpenKPIs is meant to be:
- A **reference** for defining KPIs and analytics taxonomies  
- A **starter kit** for building your organization’s KPI registry  
- A **template generator** for **SDRs (Solution Design References)** and **data layer specifications**  
- A **community repository** where analytics professionals can share best practices  

You can:
- Fork the repo  
- Modify KPI or metric YAMLs  
- Submit **Pull Requests (PRs)** to contribute improvements  
- Use templates in **dbt**, **BigQuery**, **Adobe AEP**, or **Amplitude** environments  

---

## 🚀 Roadmap

| Phase | Milestone | Description |
|-------|------------|-------------|
| **Phase 1** | Core Framework | Define KPI, Metric, Event, Dimension schemas and templates |
| **Phase 2** | Industry Packs | Add domain-specific packs (Retail, BFSI, SaaS, Media, Education) |
| **Phase 3** | Automation Tools | Excel-to-YAML converter, KPI validator, data layer generator |
| **Phase 4** | Community Portal | OpenKPIs.org website with community participation |
| **Phase 5** | AI-Driven Enrichment | Auto-recommend KPIs, map data layer, generate SQL queries |
| **Phase 6** | Community Recognition | Contributor metrics, GitHub badges, stars, forks, SDR downloads |

---

## 🤝 Contributing

We welcome contributions from everyone — analysts, engineers, designers, and students!  
You can contribute by:
- 📄 Submitting new KPIs, events, or metrics using the provided templates  
- 🐞 Reporting issues or inconsistencies  
- 🧠 Suggesting industry packs  
- 🌐 Translating documentation  

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 🧱 Governance

OpenKPIs is maintained under the **Open Data Standards Initiative** and follows an open governance model.  
Major updates and version releases will be reviewed through **community pull requests** and **issue discussions**.

---

## 💡 Example Use Cases

- Create a **cross-tool SDR** (Solution Design Reference) for GA4 and Adobe Analytics  
- Standardize **KPI documentation** across multiple brands  
- Build **AI-powered dashboards** using the YAML-driven taxonomy  
- Integrate KPI definitions into **Adobe Experience Platform**, **dbt models**, or **BI dashboards**  
- Teach analytics standardization and instrumentation to students or new analysts  

---

## 🌱 Future Direction

OpenKPIs will expand to include:
- 🔗 **Interoperability connectors** for dbt, Looker, Power BI, Tableau  
- 🧠 **LLM-based KPI suggester** for business requirement translation  
- 🧩 **Plug-and-play GitHub Action** for YAML → JSON → SQL → Markdown generation  
- 📊 **Community metrics dashboard** tracking stars, forks, and contributors  

---

## 📬 Stay Connected

- 🌐 Website: [https://openkpis.org](https://openkpis.org) 
- 💬 Join the discussion: [GitHub Discussions](https://github.com/openkpis/discussions)  
- 📰 Follow updates on [AnalyticsThinking.com](https://analyticsthinking.com) ** coming soon  
- 🧑‍🤝‍🧑 Become a contributor: [Submit your KPI](https://forms.office.com/)  ** coming soon  

---

## 🧾 License

**OpenKPIs** is released under the **MIT License**, making it free to use, modify, and distribute with attribution.

---

## ⭐ Acknowledgements

This project is powered by the passion of the analytics community — architects, marketers, engineers, and students who believe in **open data collaboration**.  

Every contributor helps move analytics closer to being a true, **global, interoperable language** of business.

---

### 📚 Additional Resources
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Project Roadmap](./ROADMAP.md)
- [Schema Reference](./docs/)
- [License (MIT)](./LICENSE.md)
#   D e p l o y m e n t   t r i g g e r  
 