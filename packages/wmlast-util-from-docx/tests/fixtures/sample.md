# Comprehensive WordML Styling Test Document

## Text Formatting Examples

### Basic Text Styles

This is **bold text** and this is _italic text_. Here's some **_bold italic_** text.
You can also use **bold** and _italic_ alternatives.

### Inline Code and Superscript/Subscript

This is `inline code` text. Here's H~2~O for subscript and x^2^ for superscript.

### Strikethrough and Underline

~~Strikethrough text~~ and <u>underlined text</u>.

## Headers and Structure

# Level 1 Header

## Level 2 Header

### Level 3 Header

#### Level 4 Header

##### Level 5 Header

###### Level 6 Header

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item 1
  - Nested item 2
    - Deeply nested item
- Third item

### Ordered Lists

1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another pending task

## Tables

### Simple Table

| Header 1 | Header 2 | Header 3  |
| -------- | -------- | --------- |
| Cell 1   | Cell 2   | Cell 3    |
| Row 2    | Data     | More data |
| Row 3    | Final    | Row       |

### Complex Table with Alignment

| Left Aligned | Center Aligned | Right Aligned |
| :----------- | :------------: | ------------: |
| Apple        |     Banana     |        Cherry |
| Dog          |    Elephant    |           Fox |
| Grape        |    Honeydew    |          Kiwi |

### Table with Merging (simulated)

| Category   | Items            | Notes   |
| ---------- | ---------------- | ------- |
| Fruits     | Apple, Banana    | Sweet   |
|            | Orange, Grape    | Citrus  |
| Vegetables | Carrot, Broccoli | Healthy |

## Blockquotes

> This is a simple blockquote.
>
> This blockquote spans multiple lines
> and can contain **formatted text**.

> Nested blockquotes are also possible:
>
> > This is a nested blockquote
> >
> > With its own formatting

## Code Blocks

### Regular Code Block

```javascript
function helloWorld() {
  console.log("Hello, World!");
  return "Success";
}
```

### Code Block with Syntax Highlighting

```python
def calculate_sum(a, b):
    """Calculate the sum of two numbers."""
    return a + b

result = calculate_sum(5, 3)
print(f"The result is: {result}")
```

## Links and References

[External Link](https://www.example.com)

[Reference Link][1]

[1]: https://www.reference.com "Reference link with title"

## Images

![Sample Image](https://via.placeholder.com/150)
![Logo](https://via.placeholder.com/100x50/FF0000/FFFFFF?text=Logo)

## Horizontal Rules

---

---

---

## Footnotes

Here's some text with a footnote[^1].

And another footnote[^2].

[^1]: This is the first footnote.

[^2]: This is the second footnote with more detail.

## Definition Lists

Term 1
: Definition 1

Term 2
: Definition 2 with more detail
: And additional details

## Mathematical Expressions (if supported)

Inline math: $E = mc^2$

Block math:

$$
\frac{d}{dx}(x^n) = nx^{n-1}
$$

## Advanced Text Formatting

### Text Colors

<span style="color: red;">Red text</span>
<span style="color: blue;">Blue text</span>
<span style="color: green;">Green text</span>

### Background Colors

<span style="background-color: yellow;">Yellow background</span>
<span style="background-color: lightgray;">Light gray background</span>

### Font Sizes

<span style="font-size: 12px;">Small text</span>
<span style="font-size: 18px;">Large text</span>

## Special Characters and Unicode

© Copyright symbol
® Registered trademark
™ Trademark
• Bullet point
→ Arrow
✓ Check mark
✗ Cross mark

## Document Structure Examples

### TOC (Table of Contents)

[TOC]

### Page Break (if supported)

<div style="page-break-after: always;"></div>

## Mixed Content Example

Here's a paragraph that combines **bold text**, _italic text_, `code snippets`, and [links](https://example.com) all in one place. It also includes a footnote[^3] for additional information.

### Lists within Tables

| Feature         | Status      | Examples                            |
| --------------- | ----------- | ----------------------------------- |
| Text Formatting | ✅ Complete | **Bold**, _Italic_, `Code`          |
| Lists           | ✅ Complete | • Ordered<br>• Unordered<br>• Tasks |
| Tables          | ✅ Complete | Multiple layouts                    |
| Images          | ⚠️ Partial  | External links only                 |

[^3]: This demonstrates how footnotes work within complex content.

## Final Section

This document demonstrates the full range of markdown formatting capabilities that should be properly converted to WordML format. It includes:

- All header levels
- Various text formatting options
- Complex table structures
- Different list types
- Code blocks with syntax highlighting
- Images and links
- Mathematical expressions
- Special characters and Unicode
- Mixed content scenarios

End of test document.
