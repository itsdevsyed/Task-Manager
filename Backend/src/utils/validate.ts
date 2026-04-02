import { ZodType } from "zod";
export const validate =
  (schema: ZodType) =>
  (data: unknown) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      const fields: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() || "unknown";
        fields[key] = issue.message;
      });

      const error: any = new Error("Validation failed");
      error.status = 422;
      error.fields = fields;

      throw error;
    }

    return result.data;
  };
