export function removeDiacritics(string) {
	return string.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}