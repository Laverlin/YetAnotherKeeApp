import { KeeData } from ".";
import { FilterChangedEvent, KeeEvent } from "./KeeEvent";

export class EntryFilter {
  #keeData: KeeData;
  #colorFilter: string = '';
  #tagFilter: string[] = [];
  #queryFilter: string = '';
  #sortField: string = 'Title';

  constructor(keeData: KeeData) {
    this.#keeData = keeData;
  }

  set colorFilter(color: string){
    this.#colorFilter = color;
    this.#keeData.fireEvent<FilterChangedEvent>(
      KeeEvent.createFilterEvent(this.#colorFilter, this.#tagFilter, this.#queryFilter));
  }
  get colorFilter(): string {
    return this.#colorFilter;
  }

  addTag2Filter(tag: string) {
    const tags = this.#tagFilter.includes(tag)
      ? this.#tagFilter.filter(i => i != tag)
      : this.#tagFilter.concat(tag);
    this.tagFilter = tags;
  }

  set tagFilter(tags: string[])
  {
    this.#tagFilter = tags
    this.#keeData.fireEvent<FilterChangedEvent>(
      KeeEvent.createFilterEvent(this.#colorFilter, this.#tagFilter, this.#queryFilter));
  }

  get tagFilter(){
    return this.#tagFilter
  }

  set queryFilter(query: string) {
    this.#queryFilter = query;
    this.#keeData.fireEvent<FilterChangedEvent>(
      KeeEvent.createFilterEvent(this.#colorFilter, this.#tagFilter, this.#queryFilter));
  }

  get queryFilter(){
    return this.#queryFilter;
  }

  set sortField(sortField: string) {
    this.#sortField = sortField;
    this.#keeData.fireEvent<FilterChangedEvent>(
      KeeEvent.createFilterEvent(this.#colorFilter, this.#tagFilter, this.#queryFilter));
  }

  get sortField(){
    return this.#sortField;
  }

}
