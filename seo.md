# MASTER PROMPT — APEXTOOLS.APP SEO + AEO IMPLEMENTATION

You are a senior technical SEO engineer, AEO/GEO specialist, UX engineer, and full-stack developer.

You are working on my existing website:

**https://apextools.app**

The project is an online utility website containing free/low-cost conversion tools and potentially other useful web tools.

Your job is to **audit the existing application and then implement a complete, production-quality SEO + AEO foundation directly in the codebase.**

I am NOT an SEO expert. Do not assume I know what technical SEO requirements are. Make sensible decisions yourself, but do not destroy or unnecessarily rewrite existing functionality.

---

# 1. PRIMARY OBJECTIVE

Transform ApexTools into a technically strong, search-engine-friendly and AI-answer-engine-friendly utility website.

The objectives are:

1. Improve Google/Bing discoverability.
2. Make individual tools capable of ranking for their specific search intent.
3. Make tool information easy for AI/search answer systems to understand and extract.
4. Create strong internal linking between related tools.
5. Make the site scalable so that adding hundreds of tools does not require manually implementing SEO for every page.
6. Avoid spammy, keyword-stuffed or low-quality programmatic SEO.
7. Preserve all existing functionality.
8. Improve performance, accessibility, mobile usability and technical SEO where appropriate.
9. Make the architecture ready for future Google Search Console/Bing Webmaster monitoring.
10. Build reusable SEO/AEO components rather than hardcoding SEO separately into every tool.

---

# 2. IMPORTANT — FIRST AUDIT THE PROJECT

Before changing anything:

### Inspect the entire project.

Determine:

* Framework
* React/Next.js/Vite/etc.
* Routing system
* Rendering strategy
* Existing metadata implementation
* Existing sitemap
* Existing robots.txt
* Existing structured data
* Existing canonical URLs
* Existing tool database/configuration
* Existing categories
* Existing navigation
* Existing footer
* Existing components
* Existing performance problems
* Existing duplicate content
* Existing dynamic routes
* Existing 404 handling
* Existing image handling
* Existing font loading
* Existing analytics
* Existing indexing controls
* Existing Open Graph/Twitter metadata
* Existing accessibility problems

Do NOT immediately rewrite the application.

First understand how it works.

Then create an internal implementation plan based on the actual codebase.

---

# 3. PRESERVE EXISTING FUNCTIONALITY

This is critical.

Do NOT:

* Delete existing tools.
* Change calculation formulas unless there is an obvious bug.
* Remove existing features.
* Replace the application architecture unnecessarily.
* Rename routes unnecessarily.
* Break existing URLs.
* Introduce unnecessary dependencies.
* Turn the application into a blog.
* Add huge blocks of useless SEO text.
* Generate thousands of thin pages.
* Keyword-stuff pages.

If an existing URL must change, implement a proper permanent redirect.

---

# 4. SEO ARCHITECTURE

Create a scalable SEO architecture.

The preferred URL structure is:

```text
/
 /tools/
 /tools/[tool-slug]
 /categories/[category-slug]
```

Examples:

```text
/tools/cm-to-inches
/tools/inches-to-cm
/tools/kg-to-lbs
/tools/lbs-to-kg
/tools/celsius-to-fahrenheit
/tools/feet-to-meters
```

Category examples:

```text
/categories/length
/categories/weight
/categories/temperature
/categories/time
/categories/data
/categories/area
/categories/volume
/categories/developer
```

Use the existing architecture if it already has an equivalent structure.

Do not create duplicate URLs for the same tool.

---

# 5. CREATE A CENTRAL TOOL SEO DATA MODEL

Do NOT manually hardcode SEO information into individual pages.

Create a centralized structure/schema for each tool.

Each tool should support fields such as:

```text
id
name
slug
category
description
shortDescription
unitFrom
unitTo
formula
conversionFactor
examples
faq
relatedTools
seoTitle
metaDescription
keywords
definition
howTo
conversionTable
lastUpdated
```

Use the existing data architecture where possible.

The SEO system must automatically generate page metadata from this information.

---

# 6. INDIVIDUAL TOOL PAGE TEMPLATE

Every important conversion tool should use a consistent, high-quality SEO/AEO page structure.

Recommended structure:

```text
Breadcrumbs

H1: [Tool Name]

Short useful introduction

Direct Answer / Quick Result section

Interactive Converter

How to Convert [X] to [Y]

Formula

Worked Examples

Conversion Table

Frequently Asked Questions

Related Converters

Useful/Related Tools
```

Do not force sections that are not relevant.

The actual converter must remain the primary focus of the page.

---

# 7. DIRECT ANSWER / AEO SECTION

Add a reusable component for concise answers.

Example:

```text
How many inches are in 1 centimeter?

1 centimeter = 0.3937007874 inches.

To convert centimeters to inches, divide the centimeter value by 2.54.
```

For another tool:

```text
How many pounds are in 1 kilogram?

1 kilogram = 2.2046226218 pounds.

To convert kilograms to pounds, multiply the kilogram value by 2.2046226218.
```

The answer should be:

* Factually accurate.
* Concise.
* Easy to extract.
* Visible on the page.
* Written naturally.

Do not fabricate information.

---

# 8. FORMULA SECTION

Every applicable conversion tool should clearly display its mathematical formula.

Example:

```text
Inches = Centimeters ÷ 2.54
```

or:

```text
Pounds = Kilograms × 2.2046226218
```

Use readable formatting.

Where appropriate, include the inverse formula.

---

# 9. EXAMPLES

Automatically generate useful examples.

Example:

```text
1 cm = 0.3937 inches
5 cm = 1.9685 inches
10 cm = 3.9370 inches
20 cm = 7.8740 inches
100 cm = 39.3701 inches
```

Do not generate hundreds of unnecessary examples.

Use a sensible number of examples.

Make sure examples are mathematically correct.

---

# 10. CONVERSION TABLES

Where useful, generate a compact conversion table.

Example:

| Centimeters | Inches  |
| ----------- | ------- |
| 1           | 0.3937  |
| 5           | 1.9685  |
| 10          | 3.9370  |
| 20          | 7.8740  |
| 50          | 19.6850 |
| 100         | 39.3701 |

Make tables:

* Responsive.
* Accessible.
* Crawlable.
* Useful to users.

Do not create thousands of table rows.

---

# 11. FAQ / AEO

Create a reusable FAQ component.

Generate questions naturally related to each tool.

Example:

### What is 1 cm in inches?

1 cm equals approximately 0.3937 inches.

### How do I convert cm to inches?

Divide the centimeter value by 2.54.

### What is 10 cm in inches?

10 cm equals approximately 3.937 inches.

### What is the cm to inches formula?

Inches = centimeters ÷ 2.54.

FAQ content must be visible on the page.

Do not create fake or unrelated questions.

---

# 12. STRUCTURED DATA / SCHEMA.ORG

Implement appropriate JSON-LD structured data.

Use only schema types that genuinely apply.

Potential schemas include:

* WebSite
* WebPage
* WebApplication
* SoftwareApplication where appropriate
* BreadcrumbList
* FAQPage where appropriate

Do NOT blindly add every schema type.

Structured data must match the visible content.

Do not use fake ratings, fake reviews, fake prices or fake organization information.

Create reusable schema generators.

For example:

```text
generateWebSiteSchema()
generateWebPageSchema()
generateToolSchema()
generateBreadcrumbSchema()
generateFAQSchema()
```

Use valid JSON-LD.

Avoid duplicate schema blocks.

---

# 13. TITLE TAGS

Every indexable page must have a unique title.

Examples:

```text
CM to Inches Converter – Free Online Calculator | ApexTools
KG to LBS Converter – Kilograms to Pounds | ApexTools
Celsius to Fahrenheit Converter | ApexTools
```

Do not use the same generic title on every page.

Titles should be:

* Relevant
* Natural
* Descriptive
* Not keyword stuffed
* Reasonably concise

Create titles automatically from tool metadata where possible.

---

# 14. META DESCRIPTIONS

Every important indexable page should have a unique meta description.

Example:

```text
Convert centimeters to inches instantly with our free CM to Inches Converter. Get accurate results, formulas, examples and conversion tables.
```

Generate descriptions from structured tool information.

Do not duplicate descriptions across all tools.

---

# 15. CANONICAL URLs

Every indexable page must have a canonical URL.

Example:

```text
https://apextools.app/tools/cm-to-inches
```

Use absolute canonical URLs.

Make sure query parameters do not accidentally create duplicate indexable versions of the same tool.

For example:

```text
/tools/cm-to-inches?value=10
```

should normally canonicalize to:

```text
/tools/cm-to-inches
```

Do not accidentally canonicalize every page to the homepage.

---

# 16. ROBOTS.TXT

Implement or improve:

```text
/robots.txt
```

Allow normal search engine crawling.

Do not block:

* Tool pages
* Category pages
* Important CSS
* Important JavaScript
* Important assets required for rendering

Block only genuinely private/admin/internal areas.

Include the sitemap location.

---

# 17. XML SITEMAP

Implement a dynamic XML sitemap.

At minimum:

```text
/sitemap.xml
```

Include:

* Homepage
* Category pages
* Indexable tool pages
* Important static pages

Do not include:

* Admin pages
* Internal application pages
* Duplicate URLs
* Parameterized duplicates
* Noindex pages
* Broken URLs

The sitemap must update automatically when tools are added.

If the framework supports multiple sitemap files, use a sitemap index for large sites.

---

# 18. BREADCRUMBS

Implement reusable breadcrumbs.

Example:

```text
Home
→ Length Converters
→ CM to Inches Converter
```

Make breadcrumbs:

* Visible
* Accessible
* SEO-friendly
* Structured with BreadcrumbList JSON-LD

---

# 19. CATEGORY PAGES

Create or improve category landing pages.

Example:

# Length Converters

Short useful introduction:

> Free online length conversion tools for converting centimeters, inches, meters, feet, yards, miles and kilometers.

Then display relevant tools.

Example:

```text
CM to Inches
Inches to CM
Meters to Feet
Feet to Meters
Miles to KM
KM to Miles
```

Category pages should contain:

* H1
* useful introduction
* tool list
* internal links
* breadcrumbs
* metadata
* appropriate schema

Do not add useless long-form text.

---

# 20. INTERNAL LINKING

Create an automatic internal linking system.

Each tool page should link to genuinely related tools.

Example:

CM to Inches:

```text
Inches to CM
CM to Feet
CM to Meters
Feet to Inches
Meters to Inches
```

KG to LBS:

```text
LBS to KG
KG to Grams
Grams to KG
KG to Ounces
```

Use contextual and "Related Converters" links.

Avoid excessive linking.

---

# 21. REVERSE CONVERTER LINK

Where a conversion has an inverse tool, clearly link to it.

Example:

```text
CM to Inches
↓
Looking for the reverse conversion?
Inches to CM
```

This is useful for users and creates strong internal linking.

---

# 22. HOMEPAGE SEO

Improve the homepage without making it cluttered.

Recommended structure:

```text
H1:
Free Online Conversion Tools

Short description

Popular Converters

Categories

Featured Tools

Recently Added Tools, if useful

Short FAQ

Footer
```

Make sure the homepage explains clearly what ApexTools is.

Do not try to rank the homepage for every conversion keyword.

Individual tools should target their own search intent.

---

# 23. IMPORTANT STATIC PAGES

Ensure the website has useful pages such as:

```text
/about
/contact
/privacy-policy
/terms
```

If appropriate, also create:

```text
/how-we-calculate
/accuracy
```

The exact routes can follow the existing application conventions.

Do not invent fake company claims, addresses, certifications, awards or credentials.

---

# 24. "HOW WE CALCULATE" PAGE

Create a useful page explaining:

* How conversion formulas work.
* How conversion factors are selected.
* How rounding works.
* Why results may differ slightly between tools because of rounding.
* That calculations are performed automatically.

Keep it factual and concise.

---

# 25. SEO-FRIENDLY PAGE CONTENT

Content must be written for humans first.

Avoid:

```text
CM to inches converter is the best CM inches conversion tool for CM to inches conversion...
```

Instead use natural language.

Search engines should see genuine useful information.

Never keyword stuff.

---

# 26. PROGRAMMATIC SEO SAFETY

ApexTools may eventually contain hundreds or thousands of tools.

Do NOT automatically create thousands of low-value pages.

Do NOT create individual pages for:

```text
10-cm-to-inches
11-cm-to-inches
12-cm-to-inches
...
```

Instead create one high-quality:

```text
/tools/cm-to-inches
```

and let the interactive calculator handle arbitrary values.

Programmatic pages should exist only when they represent a genuinely distinct user search intent/tool.

---

# 27. ACCESSIBILITY

While implementing SEO, improve accessibility.

Check:

* Proper H1/H2/H3 hierarchy.
* Form labels.
* Button labels.
* Keyboard navigation.
* Focus states.
* ARIA only where necessary.
* Color contrast.
* Table headers.
* Semantic HTML.
* Image alt text.

Do not use accessibility attributes unnecessarily.

---

# 28. PERFORMANCE / CORE WEB VITALS

Audit and improve:

* Largest Contentful Paint
* Cumulative Layout Shift
* Interaction responsiveness
* JavaScript bundle size
* Font loading
* Image optimization
* Lazy loading where appropriate
* unnecessary client-side rendering
* unnecessary dependencies

Do not sacrifice usability just to chase an artificial Lighthouse score.

The actual user experience matters.

---

# 29. MOBILE SEO

Ensure every tool page works properly on:

* Mobile phones
* Tablets
* Desktop

Converters must be easy to use with touch input.

Tables must scroll or adapt appropriately.

No horizontal page overflow.

---

# 30. IMAGE SEO

For meaningful images:

* Use descriptive filenames.
* Add appropriate alt text.
* Avoid keyword stuffing.
* Optimize image dimensions and file sizes.
* Use modern image formats where supported.

Do not add decorative images merely to create SEO content.

---

# 31. OPEN GRAPH / SOCIAL METADATA

Implement appropriate:

```text
og:title
og:description
og:url
og:type
og:image
```

Also implement Twitter/X card metadata where appropriate.

Create a sensible default social image for ApexTools if one does not exist.

For individual tools, generate appropriate titles/descriptions dynamically.

---

# 32. URL NORMALIZATION

Ensure:

```text
HTTP → HTTPS
www/non-www → one canonical version
trailing slash behavior → consistent
uppercase URLs → normalized where appropriate
duplicate routes → redirected/canonicalized
```

Do not create redirect loops.

---

# 33. 404 PAGE

Create a useful 404 page.

It should include:

* Clear message
* Search
* Popular tools
* Link to homepage
* Category links

Do not make the 404 page look like a normal tool page.

---

# 34. SEARCH FUNCTIONALITY

If the website has many tools, ensure the internal search can find tools by:

* Tool name
* Unit names
* Abbreviations
* Common wording

For example:

Searching:

```text
pounds
```

should find:

```text
KG to LBS
LBS to KG
```

Searching:

```text
centimeter
```

should find:

```text
CM to Inches
Inches to CM
CM to Feet
```

This improves UX and tool discoverability.

---

# 35. SEARCH INTENT ALIASES

Each tool should be able to have natural-language aliases.

For example:

CM to Inches:

```text
cm to inches
centimeters to inches
centimetres to inches
convert cm to inches
convert centimeters to inches
cm into inches
```

Use these primarily for understanding/search metadata and page content where natural.

Do NOT dump them into visible keyword lists.

---

# 36. AEO-FRIENDLY CONTENT MODEL

For each tool, make it possible to store:

```text
definition
directAnswer
formula
examples
faq
```

Example:

```text
definition:
A centimeter-to-inches converter converts a measurement from centimeters into inches.

directAnswer:
1 centimeter equals 0.3937007874 inches.

formula:
inches = centimeters / 2.54
```

This information should be rendered clearly.

---

# 37. CREATE AN SEO/AEO ADMIN DASHBOARD

If the existing application has an admin area, add an SEO/AEO section.

If there is no admin area, create the underlying reusable components/data structure first and only create a dashboard if it fits the existing architecture without major complexity.

The dashboard should show each tool:

```text
Tool
SEO Title
Meta Description
Direct Answer
Formula
FAQ
Schema
Canonical
Sitemap
Internal Links
Indexability
```

Show status indicators:

```text
✓ Complete
⚠ Needs attention
✕ Missing
```

Example:

```text
CM to Inches

SEO Title       ✓
Description     ✓
Direct Answer   ✓
Formula         ✓
FAQ             ✓
Schema          ✓
Canonical       ✓
Sitemap         ✓
Related Tools   ✓
```

Do not create fake "SEO scores" claiming to represent Google ranking.

If a score is implemented, clearly call it an internal completeness checklist rather than a Google ranking score.

---

# 38. SEO VALIDATION SYSTEM

Create reusable validation checks.

For every indexable tool page, check:

```text
✓ Unique title
✓ Meta description
✓ H1
✓ Canonical
✓ Description
✓ Direct answer
✓ Formula
✓ Examples
✓ FAQ
✓ Related links
✓ Breadcrumbs
✓ Structured data
✓ Sitemap inclusion
```

Display warnings where appropriate.

---

# 39. SCHEMA VALIDATION

Ensure generated JSON-LD:

* Is valid JSON.
* Does not contain undefined values.
* Does not expose internal/private information.
* Matches visible content.
* Does not contain fake ratings/reviews.

Where possible, create development-time validation/logging.

---

# 40. INDEXABILITY RULES

Only useful public pages should be indexable.

Noindex:

* Admin pages
* Login pages
* User-specific pages
* Internal dashboards
* Temporary pages
* Duplicate utility states
* Search-result pages if they are thin/duplicative
* Parameterized duplicate pages where appropriate

Do not accidentally noindex the actual tools.

---

# 41. ANALYTICS READINESS

Inspect whether analytics already exists.

Do not replace existing analytics unnecessarily.

If there is no analytics implementation, prepare the site so Google Analytics or another analytics platform can be added cleanly later.

Do not hardcode secret credentials.

---

# 42. GOOGLE SEARCH CONSOLE READINESS

Prepare the site for Google Search Console.

Ensure:

```text
/sitemap.xml
```

works correctly.

Ensure important pages are crawlable.

Ensure canonical URLs are correct.

Do not claim that Search Console has been configured unless credentials/access actually exist.

Do not fabricate indexing results.

---

# 43. BING WEBMASTER READINESS

Do the same technical preparation for Bing.

Do not claim ownership verification unless it has actually been performed.

---

# 44. AEO / GEO PRINCIPLES

Optimize content so that answer engines can understand:

1. What the tool does.
2. What question it answers.
3. The exact conversion formula.
4. The conversion factor.
5. Examples.
6. Definitions.
7. Related questions.

Use:

* Clear headings.
* Short direct answers.
* Semantic HTML.
* Structured data.
* Tables.
* Lists.
* Consistent terminology.
* Internal links.

Avoid:

* Marketing fluff.
* Long introductions before the answer.
* Keyword stuffing.
* Hidden text.
* Invisible content.
* Fake FAQ content.
* Fake citations.
* AI-generated nonsense.

---

# 45. CONTENT QUALITY

Every piece of generated content must be:

* Accurate.
* Useful.
* Concise.
* Original.
* Natural.
* Relevant to the tool.

Do not generate generic paragraphs just because SEO tools suggest a certain word count.

There is NO requirement that every page must contain 1,000+ words.

For simple converters, a concise and useful page is preferable.

---

# 46. TECHNICAL SEO TEST SUITE

After implementation, test:

### Routes

* Homepage
* Category pages
* Tool pages
* Static pages
* 404

### Metadata

* Title
* Description
* Canonical
* Open Graph
* Twitter metadata

### Crawling

* robots.txt
* sitemap.xml

### Structured data

* JSON validity
* Breadcrumb schema
* WebApplication/SoftwareApplication where appropriate
* FAQ schema where appropriate

### Functionality

* Conversion calculations
* Reverse conversion
* Search
* Related tools
* Navigation

### Responsive design

* Mobile
* Tablet
* Desktop

### Performance

* Check for unnecessary JavaScript
* Large images
* layout shifts
* slow rendering

---

# 47. DO NOT USE BLACK-HAT SEO

Never implement:

* Hidden keywords
* Hidden links
* Keyword stuffing
* Cloaking
* Fake reviews
* Fake ratings
* Fake authors
* Doorway pages
* Automatically generated spam pages
* Misleading structured data
* Invisible FAQ content
* Link schemes

ApexTools should be built as a legitimate long-term utility website.

---

# 48. SEO CONTENT GENERATION TEMPLATE

Create reusable templates.

For a conversion tool:

```text
[TOOL NAME]

[SHORT DESCRIPTION]

Quick Answer

[DIRECT ANSWER]

[CONVERTER]

How to Convert [FROM] to [TO]

[SHORT EXPLANATION]

Formula

[FORMULA]

Examples

[TABLE]

Conversion Table

[TABLE]

Frequently Asked Questions

[FAQ]

Related Converters

[LINKS]
```

Use dynamic variables.

---

# 49. RELATED TOOLS ALGORITHM

If related tools are not explicitly defined, create a sensible relationship system based on:

* Same category
* Same source unit
* Same destination unit
* Reverse conversion
* Related measurement type

Do not randomly link unrelated tools.

Limit the number of related links to a useful amount.

---

# 50. SEO-FRIENDLY FOOTER

Create a clean footer containing useful navigation such as:

```text
Popular Tools
Categories
About
Contact
Privacy
Terms
```

Do not create giant keyword-filled footer blocks.

---

# 51. INTERNAL LINKING HIERARCHY

The site should have approximately this structure:

```text
Homepage
   ↓
Category
   ↓
Tool
   ↓
Related Tools
```

And:

```text
Tool
 ↔ Reverse Tool
```

This should make important pages reachable through normal navigation.

---

# 52. SEARCH ENGINE FRIENDLY RENDERING

If the current framework uses client-side rendering, determine whether important SEO content is available in the initial HTML/server-rendered output.

For important public tool pages, ensure that:

* H1
* description
* formula
* direct answer
* FAQ
* links

are not dependent unnecessarily on delayed client-side JavaScript.

Use the framework's appropriate server-side/static rendering capabilities where practical.

Do not rewrite the entire application architecture just for this.

---

# 53. DYNAMIC META GENERATION

Implement framework-appropriate dynamic metadata.

For example:

```text
/tools/[slug]
```

should generate:

```text
title
description
canonical
Open Graph
Twitter
```

based on the tool.

Do not hardcode every route individually.

---

# 54. LAST UPDATED INFORMATION

Where appropriate, display a subtle:

```text
Last updated: [date]
```

Do not update dates artificially every time the page renders.

Only update when the underlying tool/content actually changes.

---

# 55. FUTURE BLOG / GUIDES ARCHITECTURE

Do not create a large blog unless the current application already has one.

However, keep the architecture ready for future useful guides such as:

```text
/guides/how-to-convert-cm-to-inches
/guides/metric-to-imperial-conversions
/guides/data-storage-units
```

These should support the tools rather than replace them.

---

# 56. SECURITY

While modifying the project:

* Do not expose API keys.
* Do not expose environment variables.
* Do not expose database credentials.
* Do not place secrets in client-side code.
* Do not commit secrets.
* Do not weaken authentication.

---

# 57. CODE QUALITY

Use:

* Reusable components.
* Clean naming.
* Type safety where applicable.
* Minimal dependencies.
* Existing project conventions.
* Maintainable architecture.

Avoid unnecessary refactoring.

---

# 58. FINAL IMPLEMENTATION REPORT

After making changes, provide a concise implementation report containing:

## Existing Stack

What framework and architecture ApexTools uses.

## SEO Changes

List what was implemented.

## AEO Changes

List what was implemented.

## Technical SEO

List:

* Sitemap
* robots.txt
* canonical
* metadata
* schema
* breadcrumbs
* internal linking

## Performance

List improvements made.

## Files Changed

List important files/components created or modified.

## Routes Added/Changed

List them.

## Validation

Report tests performed and their results.

## Remaining Tasks

Clearly distinguish things that require external access, such as:

* Google Search Console verification
* Bing verification
* Analytics setup
* Backlink building

Do not claim these were completed unless you actually performed them.

---

# 59. IMPORTANT EXECUTION RULE

Do not stop after creating a plan.

Actually implement the changes in the existing ApexTools codebase.

Work systematically:

```text
AUDIT
↓
PLAN
↓
IMPLEMENT
↓
TEST
↓
FIX
↓
FINAL SEO/AEO AUDIT
```

After implementation, inspect the resulting code again and fix obvious issues.

---

# 60. FINAL QUALITY STANDARD

When finished, ApexTools should have a scalable SEO/AEO architecture where adding a new tool such as:

```text
kg-to-lbs
```

automatically produces a properly structured page containing:

```text
Clean URL
Unique title
Meta description
H1
Description
Direct answer
Interactive converter
Formula
Examples
Conversion table
FAQ
Related tools
Breadcrumbs
Canonical
Open Graph
Structured data
Internal links
Sitemap inclusion
```

without requiring a developer to manually implement SEO for that individual tool.

The primary objective is not to "stuff keywords into ApexTools."

The objective is to make every useful tool:

**discoverable → understandable → crawlable → answerable → usable → internally connected.**

Begin by auditing the current ApexTools codebase, then implement the complete system.
