export function camelCaseToTitleCase(input: string): string {
  const result = input.replace(/([a-z])([A-Z])/g, "$1 $2");
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}
