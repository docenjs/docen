# DrawingML Pictures

Image Properties - Image Data

The image data for a picture is specified with the <a:blip> element within the <pic:blipFill> element (BLIP = binary large image or picture). Note the namespace used is xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main". The image data can be stored locally within the same file, or linked to a location outside of the file. The state of compression for the data is also specified. All of this information is contained within the attributes for <a:blip>.

<pic:blipFill>

<a:blip r:embed="rId4" cstate="print"/>

<a:stretch>

<a:fillRect/>

</a:stretch/>

</pic:blipFill>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.1.8.13.

### Attributes:

| Attribute | Description                                                                            |
| --------- | -------------------------------------------------------------------------------------- |
| cstate    | Specifies the compression state with which the picture is stored. Possible values are: |

- email email compression
- hqprint - high quality printing compression
- none
- print - printing compression
- screen screen viewing compression

embed | Specifies a relationship in the .rels part for the part that references the picture. For example, the sample above has r:embed="rId4". That relationship is shown here:  
<Relationship Id="rID4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.jpg/">. And the image file within the package is shown below: ![picture data](drwImages\drwImageData.gif)  
link | Specifies a relationship in the .rels part for the part that references the picture. It is used to specify an image that does not reside within the package.

---

---

# Related HTML/CSS Property:

<img src="http://www.google.com/intl/en_ALL/images/srpr/logo1w.png"/>
