import { KdbxUuid } from "kdbxweb";
import { KeeData } from ".";

export class KeeEvent {

  entryId: KdbxUuid = new KdbxUuid()

  static createFilterEvent(color?: string, tags?: string[], query?: string): FilterChangedEvent {
    let filterEvent = new FilterChangedEvent();
    filterEvent.entryId = KeeData.allGroupUuid;
    filterEvent.color = color || '';
    filterEvent.tags = tags || [];
    filterEvent.query = query || '';
    return filterEvent;
  }

  static createGroupSelectedEvent(groupUuid: KdbxUuid) {
    let event = new GroupSelectedEvent()
    event.entryId = groupUuid;
    return event;
  }

  static createEntrySelectedEvent(entryUuid: KdbxUuid, isRemoveSelection: boolean = false) {
    let event = new EntrySelectedEvent()
    event.entryId = entryUuid;
    event.isRemoveSelection = isRemoveSelection;
    return event;
  }

  static createEntryChangedEvent(entryUuid: KdbxUuid) {
    let event = new EntryChangedEvent()
    event.entryId = entryUuid;
    return event;
  }

  static createDatabaseSavedEvent(): DatabaseSavedEvent  {
    let event = new DatabaseSavedEvent()
    event.entryId = KeeData.anyEntryUuid;
    return event;
  }

  get eventName(): string {return 'keeEvent'}
}

export class EntryChangedEvent extends KeeEvent {
  get eventName(): string {return 'EntryChangedEvent'}
}

export class GroupSelectedEvent extends KeeEvent {
  get eventName(): string {return 'GroupSelectedEvent'}
}

export class DatabaseSavedEvent extends KeeEvent {
  get eventName(): string {return 'DatabaseSavedEvent'}
}

export class EntrySelectedEvent extends KeeEvent {
  get eventName(): string {return 'EntrySelectedEvent'}

  // defined is this event about remove selection (true)
  // or set new selection (false)
  //
  isRemoveSelection: boolean = true;
}

export class FilterChangedEvent extends KeeEvent {
  get eventName(): string {return 'FilterChangedEvent'}

  color: string = '';
  tags: string[] = [];
  query: string = '';
}

export class KeeEventDescriptor<T extends KeeEvent> {
  constructor(keeEventType: new() => T, entryId: KdbxUuid, listener: (event: T) => void) {
    this.#tName = new keeEventType().eventName;
    this.entryId = entryId;
    this.listener = listener;
  }
  #tName: string

  // Unique id of entry on which events the listener is subscribed
  //
  entryId: KdbxUuid;

  // listener function which taked event type as an argument
  //
  listener: (event: T) => void;

  // return the name of event type
  //
  get typeName(): string {
    return this.#tName;
  }
}







