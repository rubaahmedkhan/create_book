# Feature Specification: Urdu Translation with Chapter-Level Language Toggle

**Feature Branch**: `002-urdu-translation`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "translate the content in Urdu in the chapters by pressing a button at the start of each chapter"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Chapter in Urdu (Priority: P1)

A student who speaks Urdu as their primary language visits a chapter in the Physical AI textbook. At the start of the chapter, they see a language selection button. They click the button and select "اردو" (Urdu). The entire chapter content is immediately displayed in Urdu, including all text, headings, explanations, and code comments, while code syntax and terminal commands remain in English.

**Why this priority**: This is the core functionality requested by the user and delivers immediate value to Urdu-speaking students. It represents the minimum viable product that enables non-English speakers to access the educational content.

**Independent Test**: Can be fully tested by navigating to any chapter, clicking the language toggle button, selecting Urdu, and verifying that the chapter text is displayed in Urdu with proper RTL layout. Delivers value by making content accessible to Urdu speakers.

**Acceptance Scenarios**:

1. **Given** a student is viewing a chapter in English, **When** they click the language selection button at the chapter start and select Urdu, **Then** the chapter content is displayed in Urdu with right-to-left text direction
2. **Given** a student selects Urdu as their language, **When** they view code examples, **Then** code syntax remains in English but code comments are translated to Urdu
3. **Given** a student selects Urdu, **When** they view terminal command examples, **Then** the commands remain in English (as they represent actual system input/output)
4. **Given** a student selects Urdu, **When** they navigate to another chapter, **Then** their language preference persists and the new chapter is also displayed in Urdu

---

### User Story 2 - Switch Between Languages Seamlessly (Priority: P2)

A bilingual student who is learning in Urdu encounters a technical term they want to verify in English. They click the language toggle button and switch to English to see the original terminology. After verifying, they can switch back to Urdu without losing their reading position.

**Why this priority**: This enhances the learning experience by allowing students to cross-reference terminology and concepts between languages, which is particularly valuable for technical education.

**Independent Test**: Can be tested by switching between languages multiple times on the same chapter and verifying that the page position is maintained and content updates correctly.

**Acceptance Scenarios**:

1. **Given** a student is reading a chapter in Urdu at a specific section, **When** they switch to English, **Then** the content changes to English while maintaining their scroll position
2. **Given** a student switches languages, **When** the page reloads, **Then** the transition is smooth without losing reading context
3. **Given** a student has selected a language, **When** they close and reopen the browser, **Then** their language preference is remembered

---

### User Story 3 - View RTL Layout Correctly (Priority: P2)

An Urdu-speaking student reads the textbook in Urdu and experiences a natural right-to-left reading flow. Navigation elements, buttons, and UI components are mirrored appropriately. However, code blocks, diagrams, and mathematical formulas maintain their left-to-right orientation for technical accuracy.

**Why this priority**: Proper RTL support is essential for readability and user experience for Urdu and Arabic speakers. Without it, the content would be difficult to read despite being translated.

**Independent Test**: Can be tested by selecting Urdu and verifying that text flows right-to-left, UI elements are mirrored, but code blocks remain left-to-right.

**Acceptance Scenarios**:

1. **Given** a student selects Urdu, **When** they view chapter content, **Then** text flows right-to-left with appropriate text alignment
2. **Given** a student views Urdu content, **When** they interact with navigation elements, **Then** buttons and menus are mirrored appropriately for RTL layout
3. **Given** a student views code examples in Urdu, **When** they see code blocks, **Then** code remains left-to-right regardless of the surrounding RTL text
4. **Given** a student views diagrams with text labels in Urdu, **When** they examine the diagrams, **Then** directional flow indicators and technical diagrams maintain their original orientation

---

### User Story 4 - Access Translation Quality Information (Priority: P3)

A student viewing Urdu content wants to understand the translation quality. They can see indicators showing when content was last translated and whether translations are complete. If a section is not yet translated, they see the English version with a clear indication that translation is pending.

**Why this priority**: Transparency about translation status helps students make informed decisions about which language to use and sets appropriate expectations.

**Independent Test**: Can be tested by viewing chapters with various translation completion states and verifying that status indicators are displayed correctly.

**Acceptance Scenarios**:

1. **Given** a chapter section has no Urdu translation, **When** a student views it in Urdu mode, **Then** the English content is displayed with a clear indicator that translation is pending
2. **Given** a translation is outdated (source was updated after translation), **When** a student views it, **Then** a warning indicates that the translation may not reflect recent updates
3. **Given** a student wants to contribute translations, **When** they view untranslated content, **Then** they see information about how to contribute translations

---

### Edge Cases

- What happens when a student selects Urdu but the entire chapter has no translation? (Fallback to English with clear notification)
- How does the system handle partial translations where some paragraphs are translated and others are not? (Show translated content with English fallback for untranslated sections)
- What happens to the language toggle button when JavaScript is disabled? (Graceful degradation with language selection still available via standard HTML elements)
- How does the system handle browser back/forward navigation with language switching? (Language preference is maintained in browser history)
- What happens when a student shares a URL with a language parameter? (Recipient sees content in the specified language if available)
- How are images with embedded text handled? (Images should be language-neutral or have localized versions for each language)
- What happens with search functionality when content is displayed in Urdu? (Search should work in both Urdu and English, returning results in the user's selected language)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a prominent language selection button/dropdown at the start of each chapter
- **FR-002**: System MUST support Urdu (ur) as a selectable language option with the label "اردو"
- **FR-003**: System MUST display chapter content in Urdu when the user selects Urdu, including all text, headings, paragraphs, and code comments
- **FR-004**: System MUST preserve code syntax, terminal commands, file paths, and brand names in English even when displaying Urdu content
- **FR-005**: System MUST apply right-to-left (RTL) text direction to Urdu content
- **FR-006**: System MUST mirror UI components (navigation, buttons, menus) appropriately for RTL layout when Urdu is selected
- **FR-007**: System MUST maintain left-to-right direction for code blocks, mathematical formulas, and technical diagrams regardless of selected language
- **FR-008**: System MUST persist the user's language selection across chapter navigation within the same browser session
- **FR-009**: System MUST remember the user's language preference using browser storage (localStorage or cookies)
- **FR-010**: System MUST maintain the user's scroll position when switching languages
- **FR-011**: System MUST display English content as fallback when Urdu translation is not available for a specific section
- **FR-012**: System MUST indicate to users when content is untranslated or when translations are outdated
- **FR-013**: System MUST support URL parameters to specify language (e.g., `?lang=ur`) for sharing translated content
- **FR-014**: System MUST provide translation contribution guidelines and process information accessible from the language selection interface
- **FR-015**: System MUST display technical acronyms (SLAM, IMU, LIDAR, VLA, RAG) in English with optional Urdu explanations in parentheses on first use

### Key Entities *(include if feature involves data)*

- **Translation Content**: Represents the translated version of a chapter or section, including metadata about translation date, translator, review status, and source version
- **Language Preference**: User's selected language, stored in browser storage, including locale code, direction (LTR/RTL), and timestamp of last update
- **Translation Status**: Indicates completeness and freshness of translations for each chapter section, including completion percentage, last translation date, and last source update date
- **Translation Metadata**: Information about each translated section, including translator credits, review status, technical accuracy verification, and SME approval

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Urdu-speaking students can switch to Urdu and read complete chapters with less than 2 seconds loading time for language switching
- **SC-002**: 100% of text content that should be translated (excluding code syntax, commands, brand names) is successfully displayed in Urdu with proper RTL layout
- **SC-003**: Students can navigate through at least 5 chapters consecutively without language preference being lost or needing to reselect
- **SC-004**: The language toggle button is visible and accessible within the first viewport on chapter load (users don't need to scroll to find it)
- **SC-005**: Code blocks and technical diagrams remain readable and maintain correct orientation in RTL mode (verified through user testing)
- **SC-006**: 95% of students can successfully switch between English and Urdu and understand which content is translated vs. fallback (measured through user feedback)
- **SC-007**: Students can share Urdu chapter links and recipients correctly see Urdu content (100% success rate for URL-based language specification)
- **SC-008**: Translation status indicators are clear to at least 90% of users regarding what content is translated and what is pending (measured through user comprehension testing)

## Assumptions *(mandatory)*

- The Docusaurus i18n plugin will be used as the internationalization framework (as specified in the project constitution)
- Urdu translations will initially be provided by professional translators or qualified community contributors, not machine translation alone
- Students accessing the textbook have browsers that support RTL text rendering and CSS direction properties (all modern browsers)
- The textbook already has established content in English that will serve as the source for translation
- Translation files will follow Docusaurus i18n directory structure (i18n/ur/docusaurus-plugin-content-docs/...)
- Subject matter experts fluent in both English and Urdu will be available to review technical accuracy of translations
- Images and diagrams can be made language-neutral or separate localized versions can be created
- The language selection button will be implemented as part of the Docusaurus theme customization

## Dependencies *(mandatory)*

- Docusaurus i18n plugin must be configured and enabled in the project
- Urdu font support in the web fonts loaded by the textbook site
- Browser localStorage or cookie functionality for persisting language preferences
- Translation content files must exist in the i18n/ur directory structure
- RTL CSS styles must be available in the theme
- Translation workflow and review process must be established (as specified in constitution)

## Out of Scope

- Machine translation automation (this feature focuses on displaying human-translated content, not generating translations)
- Translation management system integration (advanced workflow tools beyond basic file-based translation)
- Audio narration of content in Urdu
- Real-time collaborative translation editing
- Automatic translation quality scoring or metrics
- Translation of code variable names or function names (only comments are translated)
- Translation of third-party embedded content (YouTube videos, external documentation links)
- Support for languages other than Urdu in this specific feature (other languages like Arabic, Chinese, Spanish, French will be separate features following the same pattern)
- Translation of historical version of chapters (only current version is translated)

## Constitution Compliance

This specification adheres to the following constitutional principles:

- **Principle I: Educational Excellence** - Makes content accessible to Urdu-speaking students, supporting inclusive learning
- **Principle VI: Accessibility and Inclusivity** - Removes language barriers for students with AI/ML backgrounds who prefer learning in Urdu
- **Principle X: Internationalization and Multilingual Accessibility** - Directly implements the constitutional requirement for multilingual support with chapter-level language selection buttons and Urdu as a priority target language
- **Technical Infrastructure** - Follows the constitutional requirement for Docusaurus i18n plugin and RTL support

All requirements align with the implementation requirements specified in Constitution Principle X, including:
- Prominent language selection button at chapter start
- Urdu (ur) as a target language
- RTL text support with proper CSS direction properties
- Translation quality standards (technical accuracy, SME review)
- Exclusion of code syntax, commands, and technical acronyms from translation
