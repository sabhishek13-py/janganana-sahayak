/**
 * The slice of JSON Schema this app uses to constrain model output.
 *
 * Typed here rather than imported from a vendor SDK: the schemas in
 * `contracts.ts` describe what the app needs, not what one provider accepts,
 * and keeping them in the standard vocabulary is what made swapping providers a
 * change to two files instead of five.
 */
export interface JsonSchema {
  readonly type: 'object';
  readonly properties: Readonly<Record<string, JsonSchemaProperty>>;
  readonly required: readonly string[];
  /**
   * Groq's `strict` mode requires this to be `false` and every property to be
   * listed in `required`; without it the request is rejected outright.
   */
  readonly additionalProperties: false;
}

export type JsonSchemaProperty =
  | { readonly type: 'string'; readonly enum?: readonly string[] }
  | { readonly type: 'boolean' }
  | { readonly type: 'number' }
  | { readonly type: 'array'; readonly items: { readonly type: 'string' } };
