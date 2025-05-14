export function generateSecureUniqueID(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  const generateSegment = (length: number): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(
      array,
      (num) => characters[num % charactersLength]
    ).join("");
  };

  const segment1 = generateSegment(3);
  const segment2 = generateSegment(4);


  return `${segment1}-${segment2}`;
}
