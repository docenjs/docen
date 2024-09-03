export function convertJSONPToJSON(
  source: string,
  options: { callbackName?: string; multiple?: boolean } = {},
): unknown {
  const multiple: boolean = options.multiple ?? false;

  const regGroup: RegExpMatchArray | null = source.match(
    /(?<functionName>.+)\(.*\)/,
  );

  const functionName: string | undefined = regGroup?.groups?.functionName;

  if (!functionName) {
    throw new Error("Function name not found");
  }

  const parser = new Function(functionName, source);

  let result: unknown[] = [];

  parser((...values: unknown[]) => {
    result = values;
  });

  return multiple ? result : result[0];
}
