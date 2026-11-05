export function result(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

export async function safely(run: () => Promise<unknown>) {
  try {
    return result(await run());
  } catch {
    return {
      ...result({
        error: "The read failed. Check the connection, permissions and input.",
      }),
      isError: true,
    };
  }
}
