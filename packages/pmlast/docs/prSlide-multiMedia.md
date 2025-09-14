# PresentationML Slides - Content - Multimedia

Multimedia such as a video or audio clip is added to a presentation as a property of a picture or shape--the fundamental building blocks of presentation slide content.

The picture or shape is specified as any other picture or shape is specified. See [DrawingML - Pictures](drwPic.md) and [DrawingML - Shapes](drwShape.md). In the example below, the image for the video is specified with the <a:blip r:embed="rId3" cstate="print"/> element. This references the relationship within the .rels file for the slide (in this case, slide2.xml.rels). Within that .rels file is the relationship with Id = rId3: <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image Target="../media/image1.png"/>.

The video attached to the picture is specified as part of the non-visual properties of the picture, within the <p:nvPr> element, which is a child of <p:nvPicPr> (if attached to a picture) or <p:nvSpPr> (if attached to a shape). The possible child elements of <p:nvPr> specifying multimedia are below. Note that each element representing a piece of multimedia is in the main drawingML namespace (with prefix 'a'), rather than in the presentation namespace (with prefix 'p'). Note also that the actual external file for the media (except for <a:audioCd> sources) is specified by the value of the r:link attribute, which is a reference to a relationship within the .rels part for the slide; the <a:wavAudioFile> source uses an r:embed attribute. So, for example, in the first sample below, the actual the video clip file is specified by the r:link="rId1" on the <a:videoFile> element. The corresponding relationship in the slide2.xml.rels part is <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/video Target="file///c:\temp\presentations\sampleMovieClip.wmv" TargetMode="External"/>.

Finally, note that the video and audio are activated and played according to the <p:timing> element for the slide, which is a child of the <p:sld>, <p:sldLayout>, and <p:sldMaster> elements. See [Slide Properties - Timing](prSlide-timing.md) for more.

### Elements:

| Element           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a:audioCd>       | Specifies the existence of audio from a CD. There are <a:st> and <a:end> child elements which specify the begin and end times. These have attributes track and time. So, e.g., <a:st track="3" time="65"/> specifies that the audio should begin on the third track at the 1 minute and 5 second mark (65 seconds).                                                                                                                                                                                                                                                                   |
| <a:audioFile>     | Specifies the existence of an audio file. There is a contentType attribute for this element which specifies the type of the external file. If the attribute is omitted, the application should attempt to determine the type by reading the contents of the target. A value of audio/mpeg is suggested.                                                                                                                                                                                                                                                                               |
| <a:quickTimeFile> | Specifies the existence of a QuickTime file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <a:videoFile>     | Specifies the existence of a video file. There is a contentType attribute for this element which specifies the type of the external file. If the attribute is omitted, the application should attempt to determine the type by reading the contents of the target. Any supported video type is possible. Some examples are video/avi, video/mpg, video/mpeg, and video/quicktime.                                                                                                                                                                                                     |
| <a:waveAudioFile> | Specifies the existence of an audio WAV file. There is a contentType attribute for this element which specifies the type of the external file. If the attribute is omitted, the application should attempt to determine the type by reading the contents of the target. Any supported video type is possible. Some examples are video/avi, video/mpg, video/mpeg, and video/quicktime. There is also a possible name attribute to give the audio a human readable name if needed. As noted above, the file is identified with the r:embed attribute rather than the r:link attribute. |

Below is a sample shape tree from a slide with a movie clip that is played when the user clicks on the first picture of the movie. The second sample is a sample of an audio file which plays when the user clicks on the image commonly used for sound.

<p:spTree>

. . .

<p:sp>

<p:nvSpPr>

<p:cNvPr id="2" name="Title 1"/>

. . .

</p:nvSpPr>

. . .

</p:sp>

<p:pic>

<p:nvPicPr>

<p:cNvPr id="4" name="movieClip.wmv">

<a:hlinkClick r:id="" action="ppaction://media"/>

</p:cNvPr>

<p:cNvPicPr>

<a:picLocks noGrp="1" noChangeAspect="1"/>

</p:cNvPicPr>

<p:nvPr>

<p:ph idx="1"/>

<a:videoFile r:link="rId1"/>

</p:nvPr>

</p:nvPicPr>

<p:blipFill>

<a:blip r:embed="rId3" cstate="print"/>

<a:stretch>

<a:fillRect/>

</a:stretch>

</p:blipFill>

<p:spPr>

<a:xfrm>

<a:off x="1524000" y="2147888"/>

<a:ext cx="6096000" cy="3429000"/>

</a:xfrm>

<a:prstGeom prst="rect">

<a:avLst/>

</a:prstGeom>

</p:spPr>

</p:pic>

</p:spTree>

![Presentation slide with video](pptxImages\ppSlide-multimedia1.gif)

<p:spTree>

. . .

<p:sp>

<p:nvSpPr>

<p:cNvPr id="2" name="Title 1"/>

. . .

</p:nvSpPr>

. . .

</p:sp>

<p:pic>

<p:nvPicPr>

<p:cNvPr id="4" name="Somewhere Over Antartica.mp3">

<a:hlinkClick r:id="" action="ppaction://media"/>

</p:cNvPr>

<p:cNvPicPr>

<a:picLocks noRot="1" noChangeAspect="1"/>

</p:cNvPicPr>

<p:nvPr>

<a:audioFile r:link="rId1"/>

</p:nvPr>

</p:nvPicPr>

<p:blipFill>

<a:blip r:embed="rId3" cstate="print"/>

<a:stretch>

<a:fillRect/>

</a:stretch>

</p:blipFill>

<p:spPr>

<a:xfrm>

<a:off x="4419600" y="3276600"/>

<a:ext cx="304800" cy="304800"/>

</a:xfrm>

<a:prstGeom prst="rect">

<a:avLst/>

</a:prstGeom>

</p:spPr>

</p:pic>

</p:spTree>

![Presentation slide with audio](pptxImages\ppSlide-multimedia2.gif)

Footer
