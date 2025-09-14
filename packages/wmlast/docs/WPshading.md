# Wordprocessing Paragraphs

Shading/Background Color

Paragraph shading/background color and foreground pattern are specified with the <w:shd> element.

![](images/note.png)Note: Compare this with the run property <w:highlight>.

<w:pPr>

<w:shd w:val="pct10"/>

</w:pPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.31 and § 17.3.5.

Word 2007 Example:

<w:pPr>

<w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/>

</w:pPr>

![Sample paragraph shading](images\wp-shd-1.gif)

---

Another Word 2007 Example:

<w:pPr>

<w:shd w:val="25pct" w:color="FF000" w:fill="FFFF00"/>

</w:pPr>

![Sample paragraph shading](images\wp-shd-2.gif)

---

### Attributes:

The most commonly used attribute values are below. There are also several theme-specific attributes, such as themeColor, themeFill, themeFillShade, etc.

| Attribute | Description                                                                                                                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fill      | Specifies the color to be used for the background. Values are given as hex values (i.e., in RRGGBB format). No # is included, unlike hex values in HTML/CSS. E.g., fill="FFFF00". A value of auto is possible, enabling the consuming software to determine the value.                        |
| color     | Specifies the color to be used for any foreground pattern specified with the val attribute. Values are given as hex values (in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., fill="FFFF00". A value of auto is possible, enabling the consuming software to determine the value. |
| val       | Specifies the pattern to be used to lay the pattern color over the background color. For example, w:val="pct10" indicates that the border style is a 10 percent foreground fill mask.                                                                                                         |

Possible values are: clear (no pattern), pct10, pct12, pct15 . . ., diagCross, diagStripe, horzCross, horzStripe, nil, thinDiagCross, solid, etc. See ECMA-376, 3rd, § 17.18.78 for a complete listing.

### Related CSS property:

background-color: #FFFF00;

CSS Example:

I feel that there is much to be said for the Celtic belief that the souls of those whom we have lost are held captive in some inferior being, in an animal, in a plant, in some inanimate object, and so effectively lost to us until the day (which to many never comes) when we happen to pass by the tree or to obtain possession of the object which forms their prison.

Then they start and tremble, they call us by our name, and as soon as we have recognized their voice the spell is broken. We have delivered them: they have overcome death and return to share our life.

And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile.
