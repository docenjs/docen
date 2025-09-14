# Package Structure

A PresentationML or .pptx file is a zip file (a package) containing a number of "parts" (typically UTF-8 or UTF-16 encoded) or XML files. The package may also contain other media files such as images. The structure is organized according to the Open Packaging Conventions as outlined in Part 2 of the OOXML standard ECMA-376.

You can look at the file structure and the files that comprise a PresentationML file by simply unzipping the .pptx file. ![PresentationML file structure](pptxImages\presentationMLStructure1.gif)

The number and types of parts will vary based on what is in the presentation, but there will always be a [Content_Types].xml, one or more relationship (.rels) parts, and a presentation part (presentation.xml), which is located within the ppt folder for Microsoft Powerpoint files. Typically there will also be at least one slide part, together with a master slide and a layout slide from which the slide is formed.

# Content Types

Every package must have a [Content_Types].xml, found at the root of the package. This file contains a list of all of the content types of the parts in the package. Every part and its type must be listed in [Content_Types].xml. The following is a content type for a slide part:

<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>

When adding new parts to the package, it is important to keep in mind that not only must you add the new part and update any relationships within .rels files, but also the Content_Types.xml file must be updated.

# Relationships

Every package contains a relationships part that defines the relationships between the other parts and to resources outside of the package. This separates the relationships from content and makes it easy to change relationships without changing the sources that reference targets.

![package relationships part](pptxImages\rootStructure3.gif)

For an OOXML package, there is always a relationships part (.rels) within the \_rels folder that identifies the starting parts of the package, or the package relationships. For example, the following defines the identity of the start part for the content of a presentation:

<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>.

There are also typically relationships within .rels for app.xml and core.xml.

In addition to the relationships part for the package, each part that is the source of one or more relationships will have its own relationships part. Each such relationship part is found within a \_rels sub-folder of the part and is named by appending '.rels' to the name of the part.

Typically the main content part (presentation.xml) has its own relationships part (presentation.xml.rels). It will contain relationships to the other parts of the content, such as slideMaster1.xml, notesMaster1.xml, handoutMaster1.xml, slide1.xml, presProps.xml, tableStyles.xml, theme1.xml, as well as the URIs for external links.

![document relationships part](pptxImages\rootStructure4.gif)

A relationship can be either explicit or implicit. For an explicit relationship, a resource is referenced using the Id attribute of a <Relationship> element. That is, the Id in the source maps directly to an Id of a relationship item, with an explicit reference to the target.

For example, a slide might contain a hyperlink such as this:

<a:hlinkClick r:id="rId2">

The r:id="rId2" references the following relationship within the relationships part for the slide (slide1.xml.rels).

<Relationship Id="rId2" Type="http://. . ./hyperlink" Target="http://www.google.com/" TargetMode="External"/>

For an implicit relationship, there is no such direct reference to a <Relationship> Id. Instead, the reference is understood.

# Parts Specific to PresentationML Documents

Below is a list of the possible parts of a PresentationML package that are specific to PresentationML presentations. Keep in mind that a presentation may only have a few of these parts. For example, if a presentation has no notes, then a notes master part will not be included in the package.

| Part                       | Description                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Comments Authors           | Contains information about each author who has added a comment to the presentation.                                                                                                        |
| Comments                   | Contains comments for a single slide.                                                                                                                                                      |
| Handout Master             | Contains the look, position, and size of the slides, notes, header and footer text, date, or page number on the presentation's handout. There can be only one such part.                   |
| Notes Master               | Contains information about the content and formatting of all notes pages. There can be only one such part.                                                                                 |
| Notes Slide                | Contains the notes for a single slide.                                                                                                                                                     |
| Presentation               | Contains the definition of a slide presentation. There must be one and only one such part. See [Presentation](PrPresentation.md).                                                          |
| Presentation Properties    | Contains all of the presentation's properties. There must be one and only one such part.                                                                                                   |
| Slide                      | Contains the content of a single slide.                                                                                                                                                    |
| Slide Layout               | Contains the definition for a slide template. It defines the default appearance and positioning of drawing objects on the slide. There must be one or more such parts.                     |
| Slide Master               | Contains the master definition of formatting, text, and objects that appear on each slide in the presentation that is derived from the slide master. There must be one or more such parts. |
| Slide Synchronization Data | Contains properties specifying the current state of a slide that is being synchronized with a version of the slide stored on a central server.                                             |
| User-Defined Tags          | Contains a set of user-defined properties for an object in a presentation. There can be zero or more such parts.                                                                           |
| View Properties            | Contains display properties for the presentation.                                                                                                                                          |

# Parts Shared by Other OOXML Documents

There are a number of part types that may appear in any OOXML package. Below are some of the more relevant parts for PresentationML documents.

| Part                                                       | Description                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audio                                                      | Contains an audio file associated wtih a handout master, notes slide, slide, slide layout, or slide master.                                                                                                                                                                                                   |
| Embedded Control                                           | Contains information about an embedded control.                                                                                                                                                                                                                                                               |
| Embedded Object                                            | Contains information about an embedded object on a slide. For example, a slide could contain an embedded video or audio object.                                                                                                                                                                               |
| Embedded package                                           | Contains a complete package, either internal or external to the referencing package. For example, a PresentationML document might contain a SpreadsheetML document.                                                                                                                                           |
| Extended File Properties (often found at docProps/app.xml) | Contains properties specific to an OOXML document--properties such as the template used, the number of slides and words, and the application name and version.                                                                                                                                                |
| File Properties, Core                                      | Core file properties enable the user to discover and set common properties within a package--properties such as creator name, creation date, title. [Dublin Core](http://dublincore.org/) properties (a set of metadate terms used to describe resources) are used whenever possible.                         |
| Image                                                      | Presentations often contain images. An image can be stored in a package as a zip item. The item must be identified by an image part relationship and the appropriate content type.                                                                                                                            |
| Theme                                                      | DrawingML is a shared language across the OOXML document types. It includes a theme part that is included in SpreadsheetML documents when the spreadsheet uses a theme. The theme part contains information about a document's theme, that is, such information as the color scheme, font and format schemes. |
| Video                                                      | Contains a video file associated wtih a handout master, notes slide, slide, slide layout, or slide master.                                                                                                                                                                                                    |
