# Wordprocessing Text

Text Shading and Highlight

There are a few text properties related to shading and highlight of text. Each is applied with child elements within the <rPr> element.

### Elements:

| Element | Description                                                                                                                                                                                                                                                                                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| shd     | Specifies the shading for the contents of the run: <w:shd w:val="pct10" w:fill="00FFFF" w:color="FF0000"/>. Shading consists of three components: background color, an optional pattern, and an optional pattern color. The resulting shading is applied by first setting the background color, then applying the pattern and pattern color. | ![text run shading](images\wp-textShade-1.gif) |

---

The most commonly used attribute values are below. There are also several theme-specific attributes, such as themeColor, themeFill, themeFillShade, etc.

| Attribute | Description                                                                                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fill      | Specifies the color to be used for the background. Values are given as hex values (i.e., in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., fill="FFFF00".                                    |
| color     | Specifies the color to be used for any foreground pattern specified with the val attribute. Values are given as hex values (in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., fill="FFFF00". |
| val       | Specifies the pattern to be used to lay the pattern color over the background color. For example, w:val="pct10" indicates that the border style is a 10 percent foreground fill mask.                    |

Possible values are: clear (no pattern), pct10, pct12, pct15 . . ., diagCross, diagStripe, horzCross, horzStripe, nil, thinDiagCross, solid, etc. See ECMA-376, 3rd, § 17.18.78 for a complete listing.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.32.

highlight | Specifies a highlighting color to be applied as background behind the contents: <w:highlight w:val="red"/> This element will supersede any background shading specified in shd. | ![text highlight](images\wp-text-highlight-1.gif)

---

The single attribute val specifies the color of the text highlighting. Possible values are: black, blue, cyan, darkBlue, darkCyan, darkGray, darkGreen, darkMagenta, darkRed, darkYellow, green, lightGray, magenta, none, red, white, yellow

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.15.

### Related CSS property:

<div>Then they start and tremble, <span style="background-color:#FFFF00"> they call us by our name</span>, and as soon as we have recognized their voice the spell is broken. We have delivered them.</div>

CSS Example:

Then they start and tremble, they call us by our name, and as soon as we have recognized their voice the spell is broken. We have delivered them.
