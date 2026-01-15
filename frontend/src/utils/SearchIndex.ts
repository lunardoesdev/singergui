interface IndexedItem<T> {
  id: number;
  searchableText: string;
  originalItem: T;
}

export class SearchIndex<T extends { id: number }> {
  private items: IndexedItem<T>[] = [];
  private getSearchableText: (item: T) => string;

  constructor(getSearchableText: (item: T) => string) {
    this.getSearchableText = getSearchableText;
  }

  setItems(items: T[]): void {
    this.items = items.map(item => ({
      id: item.id,
      searchableText: this.normalize(this.getSearchableText(item)),
      originalItem: item
    }));
  }

  search(query: string): T[] {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return this.items.map(i => i.originalItem);
    }

    const normalizedQuery = this.normalize(trimmedQuery);
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);

    return this.items
      .filter(item => terms.every(term => item.searchableText.includes(term)))
      .map(i => i.originalItem);
  }

  getAll(): T[] {
    return this.items.map(i => i.originalItem);
  }

  getCount(): number {
    return this.items.length;
  }

  private normalize(text: string): string {
    return text.toLowerCase().trim();
  }
}
