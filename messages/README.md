# BlueMind Web Service languages

The production language set is intentionally limited to languages with complete interface content:

| Language | Code | Status |
| --- | --- | --- |
| English | `en` | Complete source language |
| Svenska | `sv` | Translated, reviewed, and tested |
| العربية | `ar` | Translated, reviewed, RTL tested |

No additional language is shown in the selector until its public pages, account views, forms, demos, and accessibility labels have been translated and tested.

`npm run check:locales` verifies that the Swedish and Arabic dictionaries contain the same key set. English is the source language in the components and is therefore not duplicated in a third JSON dictionary.
