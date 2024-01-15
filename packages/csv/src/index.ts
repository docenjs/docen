export interface CSVToJSONOptions {
  header?: boolean | string | string[];
  delimiter?: string;
  repeatMarker?: string;
  quotechar?: string;
  newline?: string;
}

export function convertCSVToJSON(
  source: Uint8Array,
  options?: CSVToJSONOptions
) {
  const delimiter = options?.delimiter ?? ",";

  const repeatMarker = options?.repeatMarker ?? "$";

  const quotechar = options?.quotechar ?? '"';

  const newline = options?.newline ?? "\n";

  const csv = String.fromCharCode(...source);

  const data = csv.split(new RegExp(`\r?${newline}`, "g")).map((row) => {
    // const regex = /("[^"]*"|[^,]+)/g;
    const regex = new RegExp(
      `(${quotechar}[^${quotechar}]*${quotechar}|[^${delimiter}]+)`,
      "g"
    );

    return row.match(regex) ?? [];
  });

  const maxColumns = Math.max(...data.map((row) => row.length));

  let header: string[] = [];

  let isHeaderRow = false;

  if (options?.header === true) {
    header = data[0];

    isHeaderRow = true;
  } else if (Array.isArray(options?.header)) {
    header = options?.header;
  } else if (options?.header) {
    header = Array.from(
      { length: maxColumns },
      (_, i) => `${options?.header}${i + 1}`
    );
  }

  for (let i = 0; i < header.length; i++) {
    if (header[i].length === 0 || header.indexOf(header[i]) !== i) {
      header[i] = `${header[i]}${repeatMarker}${i + 1}`;
    }
  }

  if (header.length < maxColumns) {
    header = header.concat(
      Array.from({ length: maxColumns - header.length }, (_, i) => `${i + 1}`)
    );
  }

  const json = [];

  for (const row of data) {
    if (!isHeaderRow || data.indexOf(row) !== 0) {
      const obj: { [key: string]: string } = {};

      for (let i = 0; i < header.length; i++) {
        obj[header[i]] = row[i];

        if (!obj[header[i]]) {
          obj[header[i]] = "";
        }
      }

      json.push(obj);
    }
  }

  return json;
}
