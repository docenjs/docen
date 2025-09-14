# PresentationML Slides - Common Slide Data

The content for a slide of any type is contained within a parent <p:cSld> (common slide data) element. That is, if information is applicable to only one particular slide type (such as a transition for a presentation slide or <p:sld>), then it is contained outside of the <p:cSld> element. Anything that could appear in any slide type is within the <p:cSld> element. The <p:cSld> element is the child of the root element of the particular slide type (so a child of <p:sld> or <p:sldMaster> or <p:sldLayout>, etc.).

Slide content consists mostly of shapes and tables positioned on the slide; the shapes and tables themselves contain text or other content. See [DrawingML - Shapes](http://www.officeopenxml.com/drwShape.md) and [DrawingML - Tables](http://www.officeopenxml.com/drwTable.md) for more on shapes and tables. These shapes and tables are contained within a <p:spTree> element, which is a child of <p:cSld>. So most of the slide content is within the <p:cSld> of the slide, and most of the content of the <p:cSld> is within the <p:spTree>. Therefore when speaking of slide content, most of the discussion is about the <p:spTree>. Below is a sample slide with two shapes.

<p:sld . . . >

<p:nvGrpSpPr>

<p:cNvPr id="1" name=""/>

<p:cNvGrpSpPr/>

<p:nvPr/>

</p:nvGrpSpPr>

<p:grpSpPr>

<a:xfrm>

<a:off x="0" y="0"/>

<a:ext cx="0" cy="0"/>

<a:chOff x="0" y="0"/>

<a:chExt cx="0" cy="0"/>

</a:xfrm>

</p:grpSpPr>

<p:cSld>

<p:spTree>

<p:sp>

. . .

</p:sp>

<p:sp>

. . .

</p:sp>

</p:spTree>

</p:cSld>

<p:clrMapOvr>

<p:clrMapOvr>

<p:masterClrMapping/>

</p:sld>

The <p:cSld> element may contain the child elements shown below. Note that there is one possible attribute: name, which may be used to identify the common slide data.

### Elements:

| Element         | Description                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p:bg>          | Specifies the background for the slide. For details, see [Slide Properties - Background](prSlide-background.md).                                          |
| <p:controls>    | Specifies a list of embedded controls for the slide. Not covered here.                                                                                    |
| <p:custDataLst> | Allows for the specification of customer-defined data. Not covered here.                                                                                  |
| <p:extLst>      | Allows for the specification of extensions which may be used to store various kinds of data. Not covered here.                                            |
| <p:spTree>      | Specifies all shape-based objects on the slide, either grouped or not. For more on the shape tree, see [Slides - Content - Shapes](prSlide-shapeTree.md). |

Footer
