# Wordprocessing Fonts

Overview

The Font Table part contains information about each font used by the content. The consumer uses the Font Table part to determine which fonts to use to display content when the fonts specified in content are not available on the user's system. Two pieces of information (both optional) are stored about fonts: (1) information about the font to enable font substitution, and (2) one or more embedded forms of the font for use when the user's system does not have access to the font.

A package may have no more than two Font Table parts--one for the main document and one for the glossary. The Font Table part is referenced in the main document part's relationship file (document.xml.rels) as shown below:

<Relationships xmls="...">

<Relationship Id="" Type="http://.../fontTable" Target="fontTable.xml"/>

</Relationships>

The root element of the Font Table is Fonts. The root must contain a child font element for each font used in the document. The font element must contain the name of the font in a name attribute. This name is used to link to the font referenced in the rFonts element in the properties of a text run. See [Text - Fonts](WPfonts.md). The font element may optionally include properties allowing the application to locate a substitute font if necessary, and may optionally include embedded forms of the font.

When fonts are embedded, they can be stored as a bitmapped font (each glyph is stored as a raster image) or in a format conforming to ISO/IEC 14496-22:2007. When a font is embedded, the Font Table part will contain an explicit relationship to a Font part for that font. A package can contain zero or more Font parts. Font embedding is not discussed further here other than to point out that embedded font information is specified in child elements of the font element.

The process of determining a font to use when the referenced font is not available to the system is determined by the application. The ECMA specification recommends that the application look for the closest match to the referenced font, using the following pieces of information, in descending priority. Each is a child element of the font element.

- panose1
- sig
- charset
- pitch
- family
- altname

An example of a font table is shown below.

<w:fonts>

<w:font w:name="Arial">

<w:panose1 w:val="020B0604020202020204"/>

<w:charset w:val="00" />

<w:family w:val="swiss" />

<w:pitch w:val="variable" />

<w:sig w:usb0="20002A87" w:usb1="00000000" w:usb2="00000000" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>

</w:font>

<. . .

</w:fonts>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference §§ 11.3.5 and 17.8.
