export function cyrillicToCamelCase(input: string): string {
  const cyrillicToLatinMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya'
  };

  if (/^\d/.test(input)) {
    input = input.slice(1);
  }

  let result = '';
  let capitalizeNext = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (cyrillicToLatinMap[char]) {
      const latinChar = cyrillicToLatinMap[char];
      result += capitalizeNext ? latinChar.charAt(0).toUpperCase() + latinChar.slice(1) : latinChar;
      capitalizeNext = false;
    }
    else if (/[a-zA-Z0-9]/.test(char)) {
      result += capitalizeNext ? char.toUpperCase() : char;
      capitalizeNext = false;
    }
    else {
      capitalizeNext = true;
    }
  }

  if (result.length > 0) {
    result = result.charAt(0).toLowerCase() + result.slice(1);
  }

  return result;
}